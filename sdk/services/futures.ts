import { NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { Contract as EthCallContract } from 'ethcall';
import { BigNumber, ethers } from 'ethers';
import { defaultAbiCoder, formatBytes32String, parseBytes32String } from 'ethers/lib/utils';
import request, { gql } from 'graphql-request';
import { orderBy } from 'lodash';
import KwentaSDK from 'sdk';

import { DAY_PERIOD, KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { getFuturesAggregateStats } from 'queries/futures/subgraph';
import { FuturesAccountType } from 'queries/futures/types';
import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { BPS_CONVERSION, DEFAULT_DESIRED_TIMEDELTA } from 'sdk/constants/futures';
import { Period, PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { getContractsByNetwork, getPerpsV2MarketMulticall } from 'sdk/contracts';
import CrossMarginAccountABI from 'sdk/contracts/abis/CrossMarginAccount.json';
import FuturesMarketABI from 'sdk/contracts/abis/FuturesMarket.json';
import PerpsV2MarketInternal from 'sdk/contracts/PerpsV2MarketInternalV2';
import {
	CrossMarginAccount__factory,
	PerpsV2MarketData,
	PerpsV2Market__factory,
} from 'sdk/contracts/types';
import { IPerpsV2MarketConsolidated } from 'sdk/contracts/types/PerpsV2Market';
import { IPerpsV2MarketSettings } from 'sdk/contracts/types/PerpsV2MarketData';
import {
	queryCrossMarginAccounts,
	queryCrossMarginTransfers,
	queryIsolatedMarginTransfers,
	queryPositionHistory,
	queryTrades,
} from 'sdk/queries/futures';
import { NetworkOverrideOptions } from 'sdk/types/common';
import {
	FundingRateInput,
	FundingRateResponse,
	FundingRateUpdate,
	FuturesMarket,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesVolumes,
	MarketClosureReason,
	ContractOrderType,
	PositionDetail,
	PositionSide,
	ModifyPositionOptions,
	AccountExecuteFunctions,
	MarginTransfer,
	MarketWithIdleMargin,
	SmartMarginOrderInputs,
	ConditionalOrderTypeEnum,
} from 'sdk/types/futures';
import { PricesMap } from 'sdk/types/prices';
import {
	calculateFundingRate,
	calculateVolumes,
	encodeConditionalOrderParams,
	formatDelayedOrder,
	formatPotentialIsolatedTrade,
	formatPotentialTrade,
	getFuturesEndpoint,
	getMarketName,
	getReasonFromCode,
	mapFuturesOrderFromEvent,
	mapFuturesPosition,
	mapFuturesPositions,
	mapTrades,
	marketsForNetwork,
} from 'sdk/utils/futures';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { MarketAssetByKey, MarketKeyByAsset } from 'utils/futures';

export default class FuturesService {
	private sdk: KwentaSDK;
	public markets: FuturesMarket[] | undefined;
	public internalFuturesMarkets: Partial<
		Record<NetworkId, { [marketAddress: string]: PerpsV2MarketInternal }>
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
		market = new PerpsV2MarketInternal(this.sdk.context.provider, marketKey, marketAddress);
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
		} = this.sdk.context.multicallContracts;

		if (!PerpsV2MarketData || !PerpsV2MarketSettings || !SystemStatus || !ExchangeRates) {
			throw new Error(UNSUPPORTED_NETWORK);
		}
		const futuresData: Array<
			PerpsV2MarketData.MarketSummaryStructOutput[] | PerpsV2MarketData.FuturesGlobalsStructOutput
		> = await this.sdk.context.multicallProvider.all([
			PerpsV2MarketData.allProxiedMarketSummaries(),
			PerpsV2MarketData.globals(),
		]);

		const { markets, globals } = {
			markets: futuresData[0] as PerpsV2MarketData.MarketSummaryStructOutput[],
			globals: futuresData[1] as PerpsV2MarketData.FuturesGlobalsStructOutput,
		};

		const filteredMarkets = markets.filter((m) => {
			const marketKey = parseBytes32String(m.key) as FuturesMarketKey;
			const market = enabledMarkets.find((market) => {
				return marketKey === market.key;
			});
			return !!market;
		});

		const marketKeys = filteredMarkets.map((m) => {
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
	// TODO: Improve the API for fetching positions
	public async getFuturesPositions(
		address: string, // Cross margin or EOA address
		futuresMarkets: { asset: FuturesMarketAsset; marketKey: FuturesMarketKey; address: string }[]
	) {
		const marketDataContract = this.sdk.context.multicallContracts.FuturesMarketData;

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
		const positions = positionDetails.map((position, ind) => {
			const canLiquidate = canLiquidateState[ind];
			const marketKey = futuresMarkets[ind].marketKey;
			const asset = futuresMarkets[ind].asset;
			return mapFuturesPosition(position, canLiquidate, asset, marketKey);
		});

		return positions;
	}

	public async getAverageFundingRates(markets: FuturesMarket[], prices: PricesMap, period: Period) {
		const fundingRateInputs: FundingRateInput[] = markets.map(
			({ asset, market, currentFundingRate }) => {
				const price = prices[asset];
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

	public async getCrossMarginAccounts(walletAddress?: string | null): Promise<string[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress;
		return await queryCrossMarginAccounts(this.sdk, address);
	}

	public async getIsolatedMarginTransfers(
		walletAddress?: string | null
	): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress;
		return queryIsolatedMarginTransfers(this.sdk, address);
	}

	public async getCrossMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress;
		return queryCrossMarginTransfers(this.sdk, address);
	}

	public async getCrossMarginBalanceInfo(walletAddress: string, crossMarginAddress: string) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.provider
		);
		const { SUSD } = this.sdk.context.contracts;
		if (!SUSD) throw new Error(UNSUPPORTED_NETWORK);

		// TODO: EthCall
		const [freeMargin, keeperEthBal, allowance] = await Promise.all([
			crossMarginAccountContract.freeMargin(),
			this.sdk.context.provider.getBalance(crossMarginAddress),
			SUSD.allowance(walletAddress, crossMarginAccountContract.address),
		]);

		return {
			freeMargin: wei(freeMargin),
			keeperEthBal: wei(keeperEthBal),
			allowance: wei(allowance),
		};
	}

	public async getConditionalOrders(account: string) {
		const crossMarginAccountMultiCall = new EthCallContract(account, CrossMarginAccountABI);
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			account,
			this.sdk.context.provider
		);

		const orders = [];

		const orderIdBigNum = await crossMarginAccountContract.conditionalOrderId();
		const orderId = orderIdBigNum.toNumber();
		// Limit to the latest 100
		const start = orderId > 100 ? orderId - 100 : 0;

		const orderCalls = Array(orderId)
			.fill(0)
			.map((_, i) => crossMarginAccountMultiCall.getConditionalOrder(start + i));
		const contractOrders = (await this.sdk.context.multicallProvider.all(orderCalls)) as any;
		for (let i = 0; i < orderId; i++) {
			const contractOrder = contractOrders[i];
			// Checks if the order is still pending
			// Orders are never removed but all values set to zero so we check a zero value on price to filter pending
			if (contractOrder && contractOrder.targetPrice.gt(0)) {
				const order = mapFuturesOrderFromEvent({ ...contractOrder, id: i }, account);
				orders.push(order);
			}
		}

		return orderBy(orders, ['contractId'], 'desc');
	}

	public async getCrossMarginSettings() {
		const crossMarginSettings = this.sdk.context.multicallContracts.CrossMarginSettings;
		if (!crossMarginSettings) throw new Error(UNSUPPORTED_NETWORK);

		const fees: Array<BigNumber> = await this.sdk.context.multicallProvider.all([
			crossMarginSettings.tradeFee(),
			crossMarginSettings.limitOrderFee(),
			crossMarginSettings.stopOrderFee(),
		]);

		const { tradeFee, limitOrderFee, stopOrderFee } = {
			tradeFee: fees[0],
			limitOrderFee: fees[1],
			stopOrderFee: fees[2],
		};

		return {
			fees: {
				base: tradeFee ? wei(tradeFee.toNumber() / BPS_CONVERSION) : wei(0),
				limit: limitOrderFee ? wei(limitOrderFee.toNumber() / BPS_CONVERSION) : wei(0),
				stop: stopOrderFee ? wei(stopOrderFee.toNumber() / BPS_CONVERSION) : wei(0),
			},
		};
	}

	// Perps V2 read functions
	public async getDelayedOrder(account: string, marketAddress: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider);
		const order = await market.delayedOrders(account);
		return formatDelayedOrder(account, marketAddress, order);
	}

	public async getDelayedOrders(account: string, marketAddresses: string[]) {
		const marketContracts = marketAddresses.map(getPerpsV2MarketMulticall);

		const orders = (await this.sdk.context.multicallProvider.all(
			marketContracts.map((market) => market.delayedOrders(account))
		)) as IPerpsV2MarketConsolidated.DelayedOrderStructOutput[];

		return orders.map((order, ind) => {
			return formatDelayedOrder(account, marketAddresses[ind], order);
		});
	}

	public async getIsolatedTradePreview(
		marketAddress: string,
		orderType: ContractOrderType,
		inputs: {
			sizeDelta: Wei;
			price: Wei;
			skewAdjustedPrice: Wei;
			leverageSide: PositionSide;
		}
	) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider);
		const details = await market.postTradeDetails(
			inputs.sizeDelta.toBN(),
			inputs.price.toBN(),
			orderType,
			this.sdk.context.walletAddress
		);

		return formatPotentialIsolatedTrade(
			details,
			inputs.skewAdjustedPrice,
			inputs.sizeDelta,
			inputs.leverageSide
		);
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
			MarketAssetByKey[marketKey],
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

	public async getPositionHistory(walletAddress: string) {
		const response = await queryPositionHistory(this.sdk, walletAddress);
		return response ? mapFuturesPositions(response) : [];
	}

	// TODO: Support pagination

	public async getTradesForMarket(
		marketAsset: FuturesMarketAsset,
		walletAddress: string,
		accountType: FuturesAccountType,
		pageLength: number = 16
	) {
		const response = await queryTrades(this.sdk, {
			marketAsset,
			walletAddress,
			accountType,
			pageLength,
		});
		return response ? mapTrades(response) : [];
	}

	public async getAllTrades(
		walletAddress: string,
		accountType: FuturesAccountType,
		pageLength: number = 16
	) {
		const response = await queryTrades(this.sdk, {
			walletAddress,
			accountType,
			pageLength,
		});
		return response ? mapTrades(response) : [];
	}

	public async getIdleMargin(eoa: string, account?: string) {
		const markets = this.markets ?? (await this.getMarkets());
		const marketParams =
			markets?.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market })) ?? [];
		const positions = await this.getFuturesPositions(account ?? eoa, marketParams);
		const positionsWithIdleMargin = positions.filter(
			(p) => !p.position?.size.abs().gt(0) && p.remainingMargin.gt(0)
		);
		const idleInMarkets = positionsWithIdleMargin.reduce(
			(acc, p) => acc.add(p.remainingMargin),
			wei(0)
		);
		const { susdWalletBalance } = await this.sdk.synths.getSynthBalances(eoa);
		return {
			total: idleInMarkets.add(susdWalletBalance),
			marketsTotal: idleInMarkets,
			walletTotal: susdWalletBalance,
			marketsWithMargin: positionsWithIdleMargin.reduce<MarketWithIdleMargin[]>((acc, p) => {
				const market = markets.find((m) => m.marketKey === p.marketKey);
				if (market) {
					acc.push({
						marketAddress: market.market,
						marketKey: market.marketKey,
						position: p,
					});
				}
				return acc;
			}, []),
		};
	}

	public async calculateSmartMarginFee(
		marketKey: FuturesMarketKey,
		sizeDelta: Wei,
		orderType?: ConditionalOrderTypeEnum
	) {
		const settings = await this.getCrossMarginSettings();
		const baseRate = settings.fees.base;
		const rate = this.sdk.prices.getOffchainPrice(marketKey);
		const conditional =
			orderType === ConditionalOrderTypeEnum.STOP
				? settings.fees.stop
				: ConditionalOrderTypeEnum.LIMIT
				? settings.fees.limit
				: wei(0);
		const fee = sizeDelta.mul(baseRate.add(conditional));
		return fee.mul(rate);
	}

	// Contract mutations

	public async approveCrossMarginDeposit(
		crossMarginAddress: string,
		amount: BigNumber = ethers.constants.MaxUint256
	) {
		if (!this.sdk.context.contracts.SUSD) throw new Error(UNSUPPORTED_NETWORK);
		return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.SUSD, 'approve', [
			crossMarginAddress,
			amount,
		]);
	}

	public async depositCrossMargin(crossMarginAddress: string, amount: Wei) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);

		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN],
			[defaultAbiCoder.encode(['int256'], [amount.toBN()])],
		]);
	}

	public async withdrawCrossMargin(crossMarginAddress: string, amount: Wei) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);

		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN],
			[defaultAbiCoder.encode(['int256'], [amount.neg().toBN()])],
		]);
	}

	public async depositIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [amount.toBN()]);
		return txn;
	}

	public async withdrawIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [
			amount.neg().toBN(),
		]);
		return txn;
	}

	public async closeIsolatedPosition(marketAddress: string, priceImpactDelta: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		return market.closePositionWithTracking(priceImpactDelta.toBN(), KWENTA_TRACKING_CODE);
	}

	public async modifyIsolatedMarginPosition<T extends boolean>(
		marketAddress: string,
		sizeDelta: Wei,
		priceImpactDelta: Wei,
		options?: ModifyPositionOptions<T>
	) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);

		if (options?.delayed && options.offchain) {
			return this.sdk.transactions.createContractTxn(
				market,
				'submitOffchainDelayedOrderWithTracking',
				[sizeDelta.toBN(), priceImpactDelta.toBN(), KWENTA_TRACKING_CODE]
			);
		} else if (options?.delayed) {
			return this.sdk.transactions.createContractTxn(market, 'submitDelayedOrderWithTracking', [
				sizeDelta.toBN(),
				priceImpactDelta.toBN(),
				wei(DEFAULT_DESIRED_TIMEDELTA).toBN(),
				KWENTA_TRACKING_CODE,
			]);
		} else {
			return this.sdk.transactions.createContractTxn(market, 'modifyPositionWithTracking', [
				sizeDelta.toBN(),
				priceImpactDelta.toBN(),
				KWENTA_TRACKING_CODE,
			]);
		}
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

	public async executeDelayedOffchainOrder(
		marketKey: FuturesMarketKey,
		marketAddress: string,
		account: string
	) {
		const { Pyth } = this.sdk.context.contracts;
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
		if (!Pyth) throw new Error(UNSUPPORTED_NETWORK);

		// get price update data
		const priceUpdateData = await this.sdk.prices.getPythPriceUpdateData(marketKey);
		const updateFee = await Pyth.getUpdateFee(priceUpdateData);

		return market.executeOffchainDelayedOrder(account, priceUpdateData, { value: updateFee });
	}

	public async createCrossMarginAccount() {
		if (!this.sdk.context.contracts.CrossMarginAccountFactory) throw new Error(UNSUPPORTED_NETWORK);
		return this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.CrossMarginAccountFactory,
			'newAccount',
			[]
		);
	}

	public async submitCrossMarginOrder(
		market: {
			key: FuturesMarketKey;
			address: string;
		},
		walletAddress: string,
		crossMarginAddress: string,
		order: SmartMarginOrderInputs
	) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		const commands = [];
		const inputs = [];

		const idleMargin = await this.getIdleMargin(walletAddress, crossMarginAddress);

		// Sweep idle margin from markets to account
		if (idleMargin.marketsTotal.gt(0)) {
			idleMargin.marketsWithMargin.forEach((m) => {
				commands.push(AccountExecuteFunctions.PERPS_V2_WITHDRAW_ALL_MARGIN);
				inputs.push(defaultAbiCoder.encode(['address'], [m.marketAddress]));
			});
		}

		// TODO: Work out how best to subtract fee, do we just let the client manage this instead?
		const fee = await this.calculateSmartMarginFee(
			market.key,
			order.sizeDelta.abs(),
			order.conditionalOrderInputs?.orderType
		);
		// Add a 2% buffer because the price could change
		const feeWithBuffer = fee.add(fee.mul(0.02));
		// Need to subtract the fee so we leave enough in the accoun to pay it
		const marginDeltaMinusFees = order.marginDelta.sub(feeWithBuffer);

		if (order.marginDelta.gt(0)) {
			const depositAmount = order.marginDelta.gt(idleMargin.marketsTotal)
				? order.marginDelta.sub(idleMargin.marketsTotal).abs()
				: wei(0);
			if (depositAmount.gt(0)) {
				commands.push(AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN);
				inputs.push(defaultAbiCoder.encode(['int256'], [depositAmount.toBN()]));
			}
		}

		if (order.sizeDelta.abs().gt(0)) {
			if (!order.conditionalOrderInputs) {
				commands.push(AccountExecuteFunctions.PERPS_V2_MODIFY_MARGIN);
				inputs.push(
					defaultAbiCoder.encode(
						['address', 'int256'],
						[market.address, marginDeltaMinusFees.toBN()]
					)
				);
				commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER);
				inputs.push(
					defaultAbiCoder.encode(
						['address', 'int256', 'uint256'],
						[market.address, order.sizeDelta.toBN(), order.priceImpactDelta.toBN()]
					)
				);
			} else {
				commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
				inputs.push(
					defaultAbiCoder.encode(
						['bytes32', 'int256', 'int256', 'uint256', 'uint256', 'uint128', 'bool'],
						[
							formatBytes32String(market.key),
							marginDeltaMinusFees.toBN(),
							order.sizeDelta.toBN(),
							order.conditionalOrderInputs!.price.toBN(),
							order.conditionalOrderInputs.orderType,
							order.priceImpactDelta.toBN(),
							order.conditionalOrderInputs!.reduceOnly,
						]
					)
				);
			}
		}

		if (order.takeProfitPrice) {
			commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
			const encodedParams = encodeConditionalOrderParams(
				market.key,
				{ marginDelta: wei(0), sizeDelta: order.sizeDelta, price: order.takeProfitPrice },
				ConditionalOrderTypeEnum.LIMIT,
				order.priceImpactDelta,
				true
			);
			inputs.push(encodedParams);
		}

		if (order.stopLossPrice) {
			commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
			const encodedParams = encodeConditionalOrderParams(
				market.key,
				{ marginDelta: wei(0), sizeDelta: order.sizeDelta, price: order.stopLossPrice },
				ConditionalOrderTypeEnum.STOP,
				order.priceImpactDelta,
				true
			);
			inputs.push(encodedParams);
		}

		return this.sdk.transactions.createContractTxn(
			crossMarginAccountContract,
			'execute',
			[commands, inputs],
			{
				value: order.conditionalOrderInputs?.keeperEthDeposit.toBN() ?? '0',
			}
		);
	}

	public async closeCrossMarginPosition(
		marketAddress: string,
		crossMarginAddress: string,
		position: {
			size: Wei;
			side: PositionSide;
		},
		priceImpactDelta: Wei
	) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);

		const commands = [];
		const inputs = [];

		// TODO: Change to delayed close when market contracts are upgraded
		commands.push(AccountExecuteFunctions.PERPS_V2_CLOSE_POSITION);
		inputs.push(
			defaultAbiCoder.encode(['address', 'uint256'], [marketAddress, priceImpactDelta.toBN()])
		);

		commands.push(AccountExecuteFunctions.PERPS_V2_WITHDRAW_ALL_MARGIN);
		inputs.push(defaultAbiCoder.encode(['address'], [marketAddress]));

		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
			commands,
			inputs,
		]);
	}

	public async cancelConditionalOrder(crossMarginAddress: string, orderId: number) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);

		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER],
			[defaultAbiCoder.encode(['uint256'], [orderId])],
		]);
	}

	public async withdrawAccountKeeperBalance(crossMarginAddress: string, amount: Wei) {
		const crossMarginAccountContract = CrossMarginAccount__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'withdrawEth', [
			amount.toBN(),
		]);
	}
}
