import { wei } from '@synthetixio/wei';
import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { Period, PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { getContractsByNetwork } from 'sdk/contracts';
import { NetworkOverrideOptions } from 'sdk/types/common';
import {
	FundingRateInput,
	FundingRateResponse,
	FundingRateUpdate,
	FuturesMarket,
	FuturesMarketAsset,
	MarketClosureReason,
} from 'sdk/types/futures';
import {
	calculateFundingRate,
	getFuturesEndpoint,
	getMarketName,
	getReasonFromCode,
	marketsForNetwork,
} from 'sdk/utils/futures';
import { MarketKeyByAsset } from 'utils/futures';

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

		const { FuturesMarketSettings, SystemStatus, ExchangeRates, FuturesMarketData } = contracts;

		if (!FuturesMarketData || !FuturesMarketSettings || !SystemStatus || !ExchangeRates) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const [markets, globals] = await Promise.all([
			FuturesMarketData.allMarketSummaries(),
			FuturesMarketData.globals(),
		]);

		const filteredMarkets = markets.filter((m: any) => {
			const asset = parseBytes32String(m.asset) as FuturesMarketAsset;
			const market = enabledMarkets.find((market) => {
				return asset === market.asset;
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
					makerFeeNextPrice: wei(feeRates.makerFeeNextPrice),
					takerFeeNextPrice: wei(feeRates.takerFeeNextPrice),
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

	public async getAverageFundingRates(markets: FuturesMarket[], period: Period) {
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

		const fundingRateQueries = fundingRateInputs.map(({ marketAddress, marketKey }) => {
			return gql`
					# last before timestamp
					${marketKey}_first: fundingRateUpdates(
						first: 1
						where: { market: "${marketAddress}", timestamp_lt: $minTimestamp }
						orderBy: sequenceLength
						orderDirection: desc
					) {
						timestamp
						funding
					}

					# first after timestamp
					${marketKey}_next: fundingRateUpdates(
						first: 1
						where: { market: "${marketAddress}", timestamp_gt: $minTimestamp }
						orderBy: sequenceLength
						orderDirection: asc
					) {
						timestamp
						funding
					}

					# latest update
					${marketKey}_latest: fundingRateUpdates(
						first: 1
						where: { market: "${marketAddress}" }
						orderBy: sequenceLength
						orderDirection: desc
					) {
						timestamp
						funding
					}
				`;
		});
		const periodLength = PERIOD_IN_SECONDS[period];
		const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;

		const marketFundingResponses: Record<string, FundingRateUpdate[]> = await request(
			this.futuresGqlEndpoint,
			gql`
			query fundingRateUpdates($minTimestamp: BigInt!) {
				${fundingRateQueries.reduce((acc: string, curr: string) => {
					return acc + curr;
				})}
			}
		`,
			{ minTimestamp: minTimestamp }
		);

		const periodTitle = period === Period.ONE_HOUR ? '1H Funding Rate' : 'Funding Rate';

		const fundingRateResponses = fundingRateInputs.map(
			({ marketKey, currentFundingRate, price }) => {
				if (!price) return null;
				const marketResponses = [
					marketFundingResponses[`${marketKey}_first`],
					marketFundingResponses[`${marketKey}_next`],
					marketFundingResponses[`${marketKey}_latest`],
				];

				const responseFilt = marketResponses
					.filter((value: FundingRateUpdate[]) => value.length > 0)
					.map((entry: FundingRateUpdate[]): FundingRateUpdate => entry[0])
					.sort((a: FundingRateUpdate, b: FundingRateUpdate) => a.timestamp - b.timestamp);

				const fundingRate =
					responseFilt && !!currentFundingRate
						? calculateFundingRate(
								minTimestamp,
								periodLength,
								responseFilt,
								price,
								currentFundingRate
						  )
						: currentFundingRate ?? null;

				const fundingPeriod =
					responseFilt && !!currentFundingRate ? periodTitle : 'Inst. Funding Rate';

				const fundingRateResponse: FundingRateResponse = {
					asset: marketKey,
					fundingTitle: fundingPeriod,
					fundingRate: fundingRate,
				};
				return fundingRateResponse;
			}
		);

		return fundingRateResponses.filter((funding): funding is FundingRateResponse => !!funding);
	}
}
