import Wei, { wei } from '@synthetixio/wei';
import { Contract as EthCallContract } from 'ethcall';
import { BigNumber, ethers, utils as ethersUtils } from 'ethers';
import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import { DAY_PERIOD } from 'queries/futures/constants';
import { getFuturesAggregateStats } from 'queries/futures/subgraph';
import { mapFuturesOrders } from 'queries/futures/utils';
import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { BPS_CONVERSION } from 'sdk/constants/futures';
import { Period, PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { getContractsByNetwork } from 'sdk/contracts';
import ExchangeRatesABI from 'sdk/contracts/abis/ExchangeRates.json';
import FuturesMarketABI from 'sdk/contracts/abis/FuturesMarket.json';
import FuturesMarketDataABI from 'sdk/contracts/abis/FuturesMarketData.json';
import FuturesMarketSettingsABI from 'sdk/contracts/abis/FuturesMarketSettings.json';
import {
	CrossMarginBase__factory,
	FuturesMarketData,
	FuturesMarket__factory,
} from 'sdk/contracts/types';
import { NetworkOverrideOptions } from 'sdk/types/common';
import {
	FundingRateInput,
	FundingRateResponse,
	FundingRateUpdate,
	FuturesMarket,
	FuturesMarketAsset,
	FuturesOrder,
	FuturesVolumes,
	MarketClosureReason,
	PositionDetail,
} from 'sdk/types/futures';
import {
	calculateFundingRate,
	calculateVolumes,
	getFuturesEndpoint,
	getMarketName,
	getReasonFromCode,
	mapFuturesPosition,
	marketsForNetwork,
} from 'sdk/utils/futures';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { MarketKeyByAsset } from 'utils/futures';

export default class FuturesService {
	private sdk: KwentaSDK;
	public markets: FuturesMarket[] | undefined;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	get futuresGqlEndpoint() {
		return getFuturesEndpoint(this.sdk.context.networkId);
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

		const FuturesMarketDataEthCall = new EthCallContract(
			FuturesMarketData.address,
			FuturesMarketDataABI
		);
		const ExchangeRatesEthCall = new EthCallContract(ExchangeRates.address, ExchangeRatesABI);
		const FuturesMarketSettingsEthCall = new EthCallContract(
			FuturesMarketSettings.address,
			FuturesMarketSettingsABI
		);

		const [markets, globals] = await this.sdk.context.multicallProvider.all([
			FuturesMarketDataEthCall.allMarketSummaries(),
			FuturesMarketDataEthCall.globals(),
		]);

		const filteredMarkets = markets.filter((m: any) => {
			const asset = parseBytes32String(m.asset) as FuturesMarketAsset;
			const market = enabledMarkets.find((market) => {
				return asset === market.asset;
			});
			return !!market;
		}) as FuturesMarketData.MarketSummaryStructOutput[];

		const assetKeys = filteredMarkets.map((m: any) => {
			const asset = parseBytes32String(m.asset) as FuturesMarketAsset;
			return formatBytes32String(MarketKeyByAsset[asset]);
		});

		const currentRoundIdCalls = assetKeys.map((key: string) =>
			ExchangeRatesEthCall.getCurrentRoundId(key)
		);

		const marketLimitCalls = assetKeys.map((key: string) =>
			FuturesMarketSettingsEthCall.maxMarketValueUSD(key)
		);

		const responses = await this.sdk.context.multicallProvider.all([
			...currentRoundIdCalls,
			...marketLimitCalls,
		]);

		const currentRoundIds = responses.slice(0, currentRoundIdCalls.length);
		const marketLimits = responses.slice(currentRoundIdCalls.length);

		const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(assetKeys);

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

	// TODO: types
	public async getFuturesPositions(
		address: string, // Cross margin or EOA address
		futuresMarkets: { asset: FuturesMarketAsset; address: string }[]
	) {
		const futuresDataAddress = this.sdk.context.contracts.FuturesMarketData?.address;
		if (!this.sdk.context.isL2 || !futuresDataAddress) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const marketDataContract = new EthCallContract(futuresDataAddress, FuturesMarketDataABI);

		const positionCalls = [];
		const liquidationCalls = [];

		for (const { address: marketAddress, asset } of futuresMarkets) {
			positionCalls.push(
				marketDataContract.positionDetailsForMarketKey(
					ethersUtils.formatBytes32String(MarketKeyByAsset[asset]),
					address
				)
			);
			const marketContract = new EthCallContract(marketAddress, FuturesMarketABI);
			liquidationCalls.push(marketContract.canLiquidate(address));
		}

		// TODO: Combine these two?
		const positionDetails = (await this.sdk.context.multicallProvider.all(
			positionCalls
		)) as PositionDetail[];
		const canLiquidateState = (await this.sdk.context.multicallProvider.all(
			liquidationCalls
		)) as boolean[];

		// map the positions using the results
		const positions = positionDetails
			.map((position, ind) => {
				const canLiquidate = canLiquidateState[ind];
				const asset = futuresMarkets[ind].asset;
				return mapFuturesPosition(position, canLiquidate, asset);
			})
			.filter(({ remainingMargin }) => remainingMargin.gt(0));

		return positions;
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

	public async getDailyVolumes(): Promise<FuturesVolumes> {
		const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
		const response = await getFuturesAggregateStats(
			this.futuresGqlEndpoint,
			{
				first: 999999,
				where: {
					period: `${PERIOD_IN_SECONDS.ONE_HOUR}`,
					timestamp_gte: `${minTimestamp}`,
				},
			},
			{
				id: true,
				asset: true,
				volume: true,
				trades: true,
				timestamp: true,
				period: true,
				feesCrossMarginAccounts: true,
				feesKwenta: true,
				feesSynthetix: true,
			}
		);
		return response ? calculateVolumes(response) : {};
	}

	public async getCrossMarginBalanceInfo(crossMarginAddress: string) {
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.provider
		);
		const { SUSD } = this.sdk.context.contracts;
		if (!SUSD) throw new Error(UNSUPPORTED_NETWORK);

		// TODO: EthCall
		const [freeMargin, keeperEthBal, allowance] = await Promise.all([
			crossMarginAccountContract.freeMargin(),
			this.sdk.context.provider.getBalance(crossMarginAddress),
			SUSD.allowance(this.sdk.context.walletAddress, crossMarginAccountContract.address),
		]);

		return {
			freeMargin: wei(freeMargin),
			keeperEthBal: wei(keeperEthBal),
			allowance: wei(allowance),
		};
	}

	public async getOpenOrders(account: string, markets: FuturesMarket[]) {
		const response = await request(
			this.futuresGqlEndpoint,
			gql`
				query OpenOrders($account: String!) {
					futuresOrders(where: { abstractAccount: $account, status: Pending }) {
						id
						account
						size
						market
						asset
						targetRoundId
						marginDelta
						targetPrice
						timestamp
						orderType
					}
				}
			`,
			{ account: account }
		);

		const openOrders: FuturesOrder[] = response
			? response.futuresOrders.map((o: any) => {
					const marketInfo = markets.find((m) => m.asset === o.asset);
					return mapFuturesOrders(o, marketInfo);
			  })
			: [];
		return openOrders;
	}

	public async getCrossMarginSettings() {
		const crossMarginBaseSettings = this.sdk.context.ethCallContracts.CrossMarginBaseSettings;
		if (!crossMarginBaseSettings) throw new Error(UNSUPPORTED_NETWORK);

		const [tradeFee, limitOrderFee, stopOrderFee] = await this.sdk.context.multicallProvider.all([
			crossMarginBaseSettings.tradeFee(),
			crossMarginBaseSettings.limitOrderFee(),
			crossMarginBaseSettings.stopOrderFee(),
		]);
		return {
			tradeFee: tradeFee ? wei(tradeFee.toNumber() / BPS_CONVERSION) : wei(0),
			limitOrderFee: limitOrderFee ? wei(limitOrderFee.toNumber() / BPS_CONVERSION) : wei(0),
			stopOrderFee: stopOrderFee ? wei(stopOrderFee.toNumber() / BPS_CONVERSION) : wei(0),
		};
	}

	// Contract mutations

	public async approveCrossMarginDeposit(
		crossMarginAddress: string,
		amount: BigNumber = ethers.constants.MaxUint256
	) {
		if (!this.sdk.context.contracts.SUSD) throw new Error(UNSUPPORTED_NETWORK);
		return this.sdk.context.contracts.SUSD.approve(crossMarginAddress, amount);
	}

	public async depositCrossMargin(crossMarginAddress: string, amount: Wei) {
		// TODO: Store on instance
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		return crossMarginAccountContract.deposit(amount.toBN());
	}

	public async withdrawCrossMargin(crossMarginAddress: string, amount: Wei) {
		// TODO: Store on instance
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		return crossMarginAccountContract.withdraw(amount.toBN());
	}

	public async depositIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = FuturesMarket__factory.connect(marketAddress, this.sdk.context.signer);
		return market.transferMargin(amount.toBN());
	}

	public async withdrawIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = FuturesMarket__factory.connect(marketAddress, this.sdk.context.signer);
		return market.transferMargin(amount.neg().toBN());
	}
}
