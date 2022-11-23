import { wei } from '@synthetixio/wei';
import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils';
import KwentaSDK from 'sdk';

import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { getContractsByNetwork } from 'sdk/contracts';
import { FuturesMarket__factory } from 'sdk/contracts/types';
import { NetworkOverrideOptions } from 'sdk/types/common';
import {
	FundingRateInput,
	FundingRateResponse,
	FuturesMarket,
	FuturesMarketAsset,
	MarketClosureReason,
} from 'sdk/types/futures';
import {
	getFuturesEndpoint,
	getMarketName,
	getReasonFromCode,
	marketsForNetwork,
} from 'sdk/utils/futures';
import { FuturesMarketKey, MarketKeyByAsset } from 'utils/futures';

import * as sdkErrors from '../common/errors';

export default class FuturesService {
	private sdk: KwentaSDK;
	private futuresGqlEndpoint: string;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
		this.futuresGqlEndpoint = getFuturesEndpoint(sdk.context.networkId);
	}

	public async getMarkets(networkOverride?: NetworkOverrideOptions) {
		const enabledMarkets = marketsForNetwork(
			networkOverride?.networkId || this.sdk.context.networkId
		);

		const contracts =
			networkOverride && networkOverride?.networkId !== this.sdk.context.networkId
				? getContractsByNetwork(networkOverride.networkId, networkOverride.provider)
				: this.sdk.context.contracts;

		const {
			FuturesMarketSettings,
			SystemStatus,
			ExchangeRates,
			PerpsV2MarketData,
			AddressResolver,
		} = contracts;

		if (
			!PerpsV2MarketData ||
			!FuturesMarketSettings ||
			!SystemStatus ||
			!ExchangeRates ||
			!AddressResolver
		) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const [markets, globals] = await Promise.all([
			PerpsV2MarketData.allMarketSummaries(),
			PerpsV2MarketData.globals(),
		]);

		const filteredMarkets = markets.filter((m: any) => {
			const marketKey = parseBytes32String(m.key) as FuturesMarketKey;
			const market = enabledMarkets.find((market) => {
				return marketKey === market.key;
			});
			return !!market;
		});

		const assetKeys = filteredMarkets.map((m: any) => {
			const asset = parseBytes32String(m.asset) as FuturesMarketAsset;
			return formatBytes32String(MarketKeyByAsset[asset]);
		});

		const currentRoundIdPromises = Promise.all(
			assetKeys.map((key: string) => ExchangeRates.getCurrentRoundId(key))
		);

		const marketLimitPromises = Promise.all(
			assetKeys.map((key: string) => FuturesMarketSettings.maxMarketValueUSD(key))
		);

		const systemStatusPromise = await SystemStatus.getFuturesMarketSuspensions(assetKeys);

		const [currentRoundIds, marketLimits, { suspensions, reasons }] = await Promise.all([
			currentRoundIdPromises,
			marketLimitPromises,
			systemStatusPromise,
		]);

		const futuresMarkets = filteredMarkets.map(
			(
				{
					market,
					asset,
					currentFundingRate,
					feeRates,
					marketDebt,
					marketSkew,
					maxLeverage,
					marketSize,
					price,
				},
				i: number
			): FuturesMarket => ({
				market,
				marketKey: MarketKeyByAsset[parseBytes32String(asset) as FuturesMarketAsset],
				marketName: getMarketName(parseBytes32String(asset) as FuturesMarketAsset),
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				assetHex: asset,
				currentFundingRate: wei(currentFundingRate).neg(),
				currentRoundId: wei(currentRoundIds[i], 0),
				feeRates: {
					makerFee: wei(feeRates.makerFee),
					takerFee: wei(feeRates.takerFee),
					makerFeeDelayedOrder: wei(feeRates.makerFeeDelayedOrder),
					takerFeeDelayedOrder: wei(feeRates.takerFeeDelayedOrder),
					makerFeeOffchainDelayedOrder: wei(feeRates.makerFeeOffchainDelayedOrder),
					takerFeeOffchainDelayedOrder: wei(feeRates.takerFeeOffchainDelayedOrder),
				},
				openInterest: {
					shortPct: wei(marketSize).eq(0)
						? 0
						: wei(marketSize).sub(marketSkew).div('2').div(marketSize).toNumber(),
					longPct: wei(marketSize).eq(0)
						? 0
						: wei(marketSize).add(marketSkew).div('2').div(marketSize).toNumber(),
					shortUSD: wei(marketSize).eq(0)
						? wei(0)
						: wei(marketSize).sub(marketSkew).div('2').mul(price),
					longUSD: wei(marketSize).eq(0)
						? wei(0)
						: wei(marketSize).add(marketSkew).div('2').mul(price),
				},
				marketDebt: wei(marketDebt),
				marketSkew: wei(marketSkew),
				maxLeverage: wei(maxLeverage),
				marketSize: wei(marketSize),
				marketLimit: wei(marketLimits[i]),
				price: wei(price),
				minInitialMargin: wei(globals.minInitialMargin),
				keeperDeposit: wei(globals.minKeeperFee),
				isSuspended: suspensions[i],
				marketClosureReason: getReasonFromCode(reasons[i]) as MarketClosureReason,
			})
		);
		return futuresMarkets;
	}

	public async getAverageFundingRates(markets: FuturesMarket[]) {
		const fundingRateInputs: FundingRateInput[] = markets.map(
			({ asset, market, price, currentFundingRate }) => {
				return {
					marketAddress: market,
					marketKey: MarketKeyByAsset[asset],
					price: price,
					currentFundingRate: currentFundingRate,
				};
			}
		);

		const fundingRateResponses = fundingRateInputs.map(
			({ marketKey, currentFundingRate, price }) => {
				if (!price) return null;
				const fundingRateResponse: FundingRateResponse = {
					asset: marketKey,
					fundingTitle: 'Inst. Funding Rate',
					fundingRate: currentFundingRate ?? null,
				};
				return fundingRateResponse;
			}
		);

		return fundingRateResponses.filter((funding): funding is FundingRateResponse => !!funding);
	}

	public async transferIsolatedMargin(address: string, amount: string) {
		const futuresMarketContract = FuturesMarket__factory.connect(address, this.sdk.context.signer);
		if (!futuresMarketContract) {
			throw new Error(sdkErrors.NO_MARKET);
		}

		const { hash } = await this.sdk.transactions.createContractTxn(
			futuresMarketContract,
			'transferMargin',
			[wei(amount).toBN()]
		);

		return hash;
	}
}
