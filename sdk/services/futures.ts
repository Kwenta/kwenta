import { NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { Contract as EthCallContract } from 'ethcall';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import { DAY_PERIOD, KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { getFuturesAggregateStats } from 'queries/futures/subgraph';
import { mapFuturesOrders } from 'queries/futures/utils';
import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { BPS_CONVERSION, DEFAULT_DESIRED_TIMEDELTA } from 'sdk/constants/futures';
import { Period, PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { getContractsByNetwork } from 'sdk/contracts';
import FuturesMarketABI from 'sdk/contracts/abis/FuturesMarket.json';
import FuturesMarketInternal from 'sdk/contracts/FuturesMarketInternal';
import {
	CrossMarginBase__factory,
	PerpsV2MarketData,
	PerpsV2Market__factory,
} from 'sdk/contracts/types';
import { IPerpsV2MarketSettings } from 'sdk/contracts/types/PerpsV2MarketData';
import { NetworkOverrideOptions } from 'sdk/types/common';
import {
	FundingRateInput,
	FundingRateResponse,
	FundingRateUpdate,
	FuturesMarket,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesOrder,
	FuturesVolumes,
	MarketClosureReason,
	OrderType,
	PositionDetail,
	PositionSide,
} from 'sdk/types/futures';
import {
	calculateFundingRate,
	calculateVolumes,
	formatDelayedOrder,
	formatPotentialIsolatedTrade,
	formatPotentialTrade,
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
	public internalFuturesMarkets: Partial<
		Record<NetworkId, { [marketAddress: string]: FuturesMarketInternal }>
	> = {};

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	get futuresGqlEndpoint() {
		return getFuturesEndpoint(this.sdk.context.networkId);
	}

	private getInternalFuturesMarket(marketAddress: string, marketKey: FuturesMarketKey) {
		let market = this.internalFuturesMarkets[this.sdk.context.networkId]?.[marketAddress];
		if (market) return market;
		market = new FuturesMarketInternal(this.sdk.context.provider, marketKey, marketAddress);
		this.internalFuturesMarkets = {
			[this.sdk.context.networkId]: {
				...this.internalFuturesMarkets[this.sdk.context.networkId],
				[marketAddress]: market,
			},
		};

		return market;
	}

	public async getMarkets(networkOverride?: NetworkOverrideOptions) {
		const enabledMarkets = marketsForNetwork(
			networkOverride?.networkId || this.sdk.context.networkId
		);
		const contracts =
			networkOverride && networkOverride?.networkId !== this.sdk.context.networkId
				? getContractsByNetwork(networkOverride.networkId, networkOverride.provider)
				: this.sdk.context.contracts;

		const { SystemStatus } = contracts;
		const {
			ExchangeRates,
			PerpsV2MarketData,
			PerpsV2MarketSettings,
		} = this.sdk.context.mutliCallContracts;

		if (!PerpsV2MarketData || !PerpsV2MarketSettings || !SystemStatus || !ExchangeRates) {
			throw new Error(UNSUPPORTED_NETWORK);
		}
		const [markets, globals] = await this.sdk.context.multicallProvider.all([
			PerpsV2MarketData.allProxiedMarketSummaries(),
			PerpsV2MarketData.globals(),
		]);

		const filteredMarkets = (markets as PerpsV2MarketData.MarketSummaryStructOutput[]).filter(
			(m) => {
				const marketKey = parseBytes32String(m.key) as FuturesMarketKey;
				const market = enabledMarkets.find((market) => {
					return marketKey === market.key;
				});
				return !!market;
			}
		);

		const marketKeys = filteredMarkets.map((m: any) => {
			return m.key;
		});

		const currentRoundIdCalls = marketKeys.map((key: string) =>
			ExchangeRates.getCurrentRoundId(key)
		);

		const parametersCalls = marketKeys.map((key: string) => PerpsV2MarketSettings.parameters(key));

		const responses = await this.sdk.context.multicallProvider.all([
			...currentRoundIdCalls,
			...parametersCalls,
		]);

		const currentRoundIds = responses.slice(0, currentRoundIdCalls.length);
		const marketParameters = responses.slice(
			currentRoundIdCalls.length
		) as IPerpsV2MarketSettings.ParametersStructOutput[];

		const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(marketKeys);

		const futuresMarkets = filteredMarkets.map(
			(
				{
					market,
					key,
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
				marketKey: parseBytes32String(key) as FuturesMarketKey,
				marketName: getMarketName(parseBytes32String(asset) as FuturesMarketAsset),
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				assetHex: asset,
				currentFundingRate: wei(currentFundingRate).div(24),
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
				marketLimit: wei(marketParameters[i].maxMarketValue).mul(wei(price)),
				priceOracle: wei(price),
				price: wei(price).mul(wei(marketSkew).div(wei(marketParameters[i].skewScale)).add(1)),
				minInitialMargin: wei(globals.minInitialMargin),
				keeperDeposit: wei(globals.minKeeperFee),
				isSuspended: suspensions[i],
				marketClosureReason: getReasonFromCode(reasons[i]) as MarketClosureReason,
				settings: {
					maxMarketValue: wei(marketParameters[i].maxMarketValue),
					skewScale: wei(marketParameters[i].skewScale),
					delayedOrderConfirmWindow: wei(
						marketParameters[i].delayedOrderConfirmWindow,
						0
					).toNumber(),
					offchainDelayedOrderMinAge: wei(
						marketParameters[i].offchainDelayedOrderMinAge,
						0
					).toNumber(),
					offchainDelayedOrderMaxAge: wei(
						marketParameters[i].offchainDelayedOrderMaxAge,
						0
					).toNumber(),
					minDelayTimeDelta: wei(marketParameters[i].minDelayTimeDelta, 0).toNumber(),
					maxDelayTimeDelta: wei(marketParameters[i].maxDelayTimeDelta, 0).toNumber(),
				},
			})
		);
		return futuresMarkets;
	}

	// TODO: types
	public async getFuturesPositions(
		address: string, // Cross margin or EOA address
		futuresMarkets: { asset: FuturesMarketAsset; marketKey: FuturesMarketKey; address: string }[]
	) {
		const marketDataContract = this.sdk.context.mutliCallContracts.FuturesMarketData;

		if (!this.sdk.context.isL2 || !marketDataContract) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const positionCalls = [];
		const liquidationCalls = [];

		for (const { address: marketAddress, marketKey } of futuresMarkets) {
			positionCalls.push(
				marketDataContract.positionDetailsForMarketKey(formatBytes32String(marketKey), address)
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
				const marketKey = futuresMarkets[ind].marketKey;
				const asset = futuresMarkets[ind].asset;
				return mapFuturesPosition(position, canLiquidate, asset, marketKey);
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
				marketKey: true,
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
		const crossMarginBaseSettings = this.sdk.context.mutliCallContracts.CrossMarginBaseSettings;
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

	// Perps V2 read functions
	public async getDelayedOrder(account: string, marketInfo: FuturesMarket<Wei>) {
		const market = PerpsV2Market__factory.connect(marketInfo.market, this.sdk.context.signer);
		const order = await market.delayedOrders(account);
		return formatDelayedOrder(account, marketInfo, order);
	}

	public async getIsolatedTradePreview(
		marketAddress: string,
		sizeDelta: Wei,
		priceOracle: Wei,
		price: Wei,
		leverageSide: PositionSide,
		orderType: OrderType
	) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		const details = await market.postTradeDetails(
			sizeDelta.toBN(),
			priceOracle.toBN(),
			orderType,
			this.sdk.context.walletAddress
		);
		return formatPotentialIsolatedTrade(details, price, sizeDelta, leverageSide);
	}

	public async getCrossMarginTradePreview(
		crossMarginAccount: string,
		marketKey: FuturesMarketKey,
		marketAddress: string,
		tradeParams: {
			sizeDelta: Wei;
			marginDelta: Wei;
			orderPrice?: Wei;
			leverageSide: PositionSide;
		}
	) {
		const marketInternal = this.getInternalFuturesMarket(marketAddress, marketKey);

		const preview = await marketInternal.getTradePreview(
			crossMarginAccount,
			tradeParams.sizeDelta.toBN(),
			tradeParams.marginDelta.toBN(),
			tradeParams.orderPrice?.toBN()
		);

		return formatPotentialTrade(preview, tradeParams.sizeDelta, tradeParams.leverageSide);
	}

	public async getCrossMarginKeeperBalance(account: string) {
		const bal = await this.sdk.context.provider.getBalance(account);
		return wei(bal);
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
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		return market.transferMargin(amount.toBN());
	}

	public async withdrawIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		return market.transferMargin(amount.neg().toBN());
	}

	public async closeIsolatedPosition(marketAddress: string, priceImpactDelta: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		return market.closePositionWithTracking(priceImpactDelta.toBN(), KWENTA_TRACKING_CODE);
	}

	public async modifyIsolatedMarginPosition<T extends boolean>(
		marketAddress: string,
		sizeDelta: Wei,
		priceImpactDelta: Wei,
		delayed = false,
		offchain = false,
		estimationOnly: T
	): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		const root = estimationOnly ? market.estimateGas : market;
		return delayed && offchain
			? (root.submitOffchainDelayedOrderWithTracking(
					sizeDelta.toBN(),
					priceImpactDelta.toBN(),
					KWENTA_TRACKING_CODE
			  ) as any)
			: delayed
			? (root.submitDelayedOrderWithTracking(
					sizeDelta.toBN(),
					priceImpactDelta.toBN(),
					wei(DEFAULT_DESIRED_TIMEDELTA).toBN(),
					KWENTA_TRACKING_CODE
			  ) as any)
			: (root.modifyPositionWithTracking(
					sizeDelta.toBN(),
					priceImpactDelta.toBN(),
					KWENTA_TRACKING_CODE
			  ) as any);
	}

	public async cancelDelayedOrder(marketAddress: string, account: string, isOffchain: boolean) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		return isOffchain
			? market.cancelOffchainDelayedOrder(account)
			: market.cancelDelayedOrder(account);
	}

	public async executeDelayedOrder(marketAddress: string, account: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		return market.executeDelayedOrder(account);
	}
}

type TxReturn<T extends boolean = false> = Promise<
	T extends true ? BigNumber : ContractTransaction
>;
