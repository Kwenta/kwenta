import { NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { Contract as EthCallContract } from 'ethcall';
import { BigNumber, ContractTransaction, ethers } from 'ethers';
import { formatBytes32String, parseBytes32String } from 'ethers/lib/utils';
import request, { gql } from 'graphql-request';
import { orderBy } from 'lodash';
import KwentaSDK from 'sdk';

import { DAY_PERIOD, KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import {
	getFuturesAggregateStats,
	getFuturesPositions,
	getFuturesTrades,
} from 'queries/futures/subgraph';
import { mapFuturesPositions } from 'queries/futures/utils';
import { LatestRate } from 'queries/rates/types';
import { getRatesEndpoint, mapLaggedDailyPrices } from 'queries/rates/utils';
import { UNSUPPORTED_NETWORK } from 'sdk/common/errors';
import { BPS_CONVERSION } from 'sdk/constants/futures';
import { Period, PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { getContractsByNetwork } from 'sdk/contracts';
import CrossMarginBaseABI from 'sdk/contracts/abis/CrossMarginBase.json';
import FuturesMarketABI from 'sdk/contracts/abis/FuturesMarket.json';
import FuturesMarketInternal from 'sdk/contracts/FuturesMarketInternal';
import {
	CrossMarginBase__factory,
	FuturesMarketData,
	FuturesMarket__factory,
} from 'sdk/contracts/types';
import { queryCrossMarginAccounts } from 'sdk/queries/futures';
import { NetworkOverrideOptions } from 'sdk/types/common';
import {
	CrossMarginOrderType,
	FundingRateInput,
	FundingRateResponse,
	FundingRateUpdate,
	FuturesMarket,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesVolumes,
	MarketClosureReason,
	PositionDetail,
	PositionSide,
} from 'sdk/types/futures';
import {
	calculateFundingRate,
	calculateVolumes,
	formatPotentialTrade,
	getDisplayAsset,
	getFuturesEndpoint,
	getMarketName,
	getReasonFromCode,
	mapFuturesOrderFromEvent,
	mapFuturesPosition,
	mapTrades,
	marketsForNetwork,
} from 'sdk/utils/futures';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { MarketAssetByKey, MarketKeyByAsset } from 'utils/futures';
import { FuturesAccountType, FuturesAccountTypes } from 'queries/futures/types';

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
			FuturesMarketSettings,
			ExchangeRates,
			FuturesMarketData,
		} = this.sdk.context.multicallContracts;

		if (!FuturesMarketData || !FuturesMarketSettings || !SystemStatus || !ExchangeRates) {
			throw new Error(UNSUPPORTED_NETWORK);
		}

		const [markets, globals] = await this.sdk.context.multicallProvider.all([
			FuturesMarketData.allMarketSummaries(),
			FuturesMarketData.globals(),
		]);

		const filteredMarkets = markets.filter((m: any) => {
			const marketKey = parseBytes32String(m.key) as FuturesMarketKey;
			const market = enabledMarkets.find((market) => {
				return marketKey === market.key;
			});
			return !!market;
		}) as FuturesMarketData.MarketSummaryStructOutput[];

		const marketKeys = filteredMarkets.map((m: any) => {
			return m.key;
		});

		const currentRoundIdCalls = marketKeys.map((key: string) =>
			ExchangeRates.getCurrentRoundId(key)
		);

		const marketLimitCalls = marketKeys.map((key: string) =>
			FuturesMarketSettings.maxMarketValueUSD(key)
		);

		const responses = await this.sdk.context.multicallProvider.all([
			...currentRoundIdCalls,
			...marketLimitCalls,
		]);

		const currentRoundIds = responses.slice(0, currentRoundIdCalls.length);
		const marketLimits = responses.slice(currentRoundIdCalls.length);

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
				currentFundingRate: wei(currentFundingRate).neg(),
				currentRoundId: wei(currentRoundIds[i], 0),
				feeRates: {
					makerFee: wei(feeRates.makerFee),
					takerFee: wei(feeRates.takerFee),
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

	public async getCrossMarginAccounts(walletAddress?: string | null) {
		const address = walletAddress ?? this.sdk.context.walletAddress;
		return await queryCrossMarginAccounts(this.sdk, address);
	}

	public async getCrossMarginBalanceInfo(walletAddress: string, crossMarginAddress: string) {
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
			SUSD.allowance(walletAddress, crossMarginAccountContract.address),
		]);

		return {
			freeMargin: wei(freeMargin),
			keeperEthBal: wei(keeperEthBal),
			allowance: wei(allowance),
		};
	}

	public async getCrossMarginOpenOrders(account: string) {
		const crossMarginBaseMultiCall = new EthCallContract(account, CrossMarginBaseABI);
		const crossMarginBaseContract = CrossMarginBase__factory.connect(
			account,
			this.sdk.context.provider
		);

		const orders = [];

		const orderIdBigNum = await crossMarginBaseContract.orderId();
		const orderId = orderIdBigNum.toNumber();

		const orderCalls = Array(orderId)
			.fill(0)
			.map((_, i) => crossMarginBaseMultiCall.orders(i));
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
		const crossMarginBaseSettings = this.sdk.context.multicallContracts.CrossMarginBaseSettings;
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

	public async getIsolatedTradePreview(
		marketAddress: string,
		sizeDelta: Wei,
		leverageSide: PositionSide
	) {
		const market = FuturesMarket__factory.connect(marketAddress, this.sdk.context.provider);
		const details = await market.postTradeDetails(
			wei(sizeDelta).toBN(),
			this.sdk.context.walletAddress
		);
		return formatPotentialTrade(details, sizeDelta, leverageSide);
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

	public async getDynamicFeeRate(marketAsset: FuturesMarketAsset) {
		const dynamicFeeRate = await this.sdk.context.contracts.Exchanger?.dynamicFeeRateForExchange(
			ethers.utils.formatBytes32String('sUSD'),
			ethers.utils.formatBytes32String(marketAsset)
		);
		if (dynamicFeeRate) {
			return { feeRate: wei(dynamicFeeRate.feeRate), tooVolatile: dynamicFeeRate.tooVolatile };
		}
		return undefined;
	}

	public async getPreviousDayRates(marketAssets: FuturesMarketAsset[], networkId?: NetworkId) {
		const ratesEndpoint = getRatesEndpoint(networkId || this.sdk.context.networkId);
		const minTimestamp = Math.floor((Date.now() - 60 * 60 * 24 * 1000) / 1000);

		const rateUpdateQueries = marketAssets.map((asset) => {
			return gql`
			# last before timestamp
			${asset}: rateUpdates(
				first: 1
				where: { synth: "${getDisplayAsset(asset) ?? asset}", timestamp_gte: $minTimestamp }
				orderBy: timestamp
				orderDirection: asc
			) {
				synth
				rate
			}
		`;
		});

		const response = await request(
			ratesEndpoint,
			gql`
				query rateUpdates($minTimestamp: BigInt!) {
					${rateUpdateQueries.reduce((acc: string, curr: string) => {
						return acc + curr;
					})}
			}`,
			{
				minTimestamp: minTimestamp,
			}
		);
		const latestRates = (response ? Object.values(response).flat() : []) as LatestRate[];
		return mapLaggedDailyPrices(latestRates);
	}

	public async getPositionHistory(account: string) {
		const response = await getFuturesPositions(
			this.futuresGqlEndpoint,
			{
				where: {
					account: account,
				},
				first: 99999,
				orderBy: 'openTimestamp',
				orderDirection: 'desc',
			},
			{
				id: true,
				lastTxHash: true,
				openTimestamp: true,
				closeTimestamp: true,
				timestamp: true,
				market: true,
				asset: true,
				account: true,
				abstractAccount: true,
				accountType: true,
				isOpen: true,
				isLiquidated: true,
				trades: true,
				totalVolume: true,
				size: true,
				initialMargin: true,
				margin: true,
				pnl: true,
				feesPaid: true,
				netFunding: true,
				pnlWithFeesPaid: true,
				netTransfers: true,
				totalDeposits: true,
				fundingIndex: true,
				entryPrice: true,
				avgEntryPrice: true,
				lastPrice: true,
				exitPrice: true,
			}
		);

		return response ? mapFuturesPositions(response) : [];
	}

	// TODO: Support pagination

	public async getTrades(
		marketAsset: FuturesMarketAsset,
		address: string,
		accountType: FuturesAccountType,
		pageLength: number = 16
	) {
		const response = await getFuturesTrades(
			this.futuresGqlEndpoint,
			{
				first: pageLength,
				where: {
					asset: `${formatBytes32String(marketAsset)}`,
					account: address,
					accountType: accountType,
				},
				orderDirection: 'desc',
				orderBy: 'timestamp',
			},
			{
				id: true,
				timestamp: true,
				account: true,
				abstractAccount: true,
				accountType: true,
				margin: true,
				size: true,
				asset: true,
				price: true,
				positionId: true,
				positionSize: true,
				positionClosed: true,
				pnl: true,
				feesPaid: true,
				orderType: true,
			}
		);
		return response ? mapTrades(response) : [];
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

	public async closeIsolatedPosition(marketAddress: string) {
		const market = FuturesMarket__factory.connect(marketAddress, this.sdk.context.signer);
		return market.closePositionWithTracking(KWENTA_TRACKING_CODE);
	}

	public async modifyIsolatedMarginPosition<T extends boolean>(
		marketAddress: string,
		sizeDelta: Wei,
		estimationOnly: T
	): TxReturn<T> {
		const market = FuturesMarket__factory.connect(marketAddress, this.sdk.context.signer);
		const root = estimationOnly ? market.estimateGas : market;
		return root.modifyPositionWithTracking(sizeDelta.toBN(), KWENTA_TRACKING_CODE) as any;
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
		market: FuturesMarketKey,
		crossMarginAddress: string,
		order: {
			type: CrossMarginOrderType;
			sizeDelta: Wei;
			marginDelta: Wei;
			advancedOrderInputs?: {
				price: Wei;
				feeCap: Wei;
				keeperEthDeposit: Wei;
			};
		}
	) {
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		if (order.type === 'market') {
			const newPosition = [
				{
					marketKey: formatBytes32String(market),
					marginDelta: order.marginDelta.toBN(),
					sizeDelta: order.sizeDelta.toBN(),
				},
			];

			return await crossMarginAccountContract.distributeMargin(newPosition);
		}
		if ((order.type === 'limit' || order.type === 'stop market') && !order.advancedOrderInputs) {
			throw new Error('Missing inputs for advanced order');
		}

		const enumType = order.type === 'limit' ? 0 : 1;

		return this.sdk.transactions.createContractTxn(
			crossMarginAccountContract,
			'placeOrderWithFeeCap',
			[
				formatBytes32String(market),
				order.marginDelta.toBN(),
				order.sizeDelta.toBN(),
				order.advancedOrderInputs?.price.toBN() ?? '0',
				enumType,
				order.advancedOrderInputs?.feeCap.toBN() ?? '0',
			],
			{ value: order.advancedOrderInputs?.keeperEthDeposit.toBN() ?? '0' }
		);
	}

	public async closeCrossMarginPosition(
		marketKey: FuturesMarketKey,
		crossMarginAddress: string,
		position: {
			size: Wei;
			side: PositionSide;
		}
	) {
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);

		const closeParams =
			['SOL', 'DebtRatio'].includes(MarketAssetByKey[marketKey]) &&
			position.side === PositionSide.SHORT
				? [
						{
							marketKey: formatBytes32String(marketKey),
							marginDelta: wei('0').toBN(),
							sizeDelta: position.size.add(wei(1, 18, true)).toBN(),
						},
						{
							marketKey: formatBytes32String(marketKey),
							marginDelta: wei('0').toBN(),
							sizeDelta: wei(1, 18, true).neg().toBN(),
						},
				  ]
				: [
						{
							marketKey: formatBytes32String(marketKey),
							marginDelta: wei('0').toBN(),
							sizeDelta:
								position.side === PositionSide.LONG
									? position.size.neg().toBN()
									: position.size.toBN(),
						},
				  ];

		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'distributeMargin', [
			closeParams,
		]);
	}

	public async cancelCrossMarginOrder(crossMarginAddress: string, orderId: string) {
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'cancelOrder', [
			orderId,
		]);
	}

	public async withdrawAccountKeeperBalance(crossMarginAddress: string, amount: Wei) {
		const crossMarginAccountContract = CrossMarginBase__factory.connect(
			crossMarginAddress,
			this.sdk.context.signer
		);
		return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'withdrawEth', [
			amount.toBN(),
		]);
	}
}

type TxReturn<T extends boolean = false> = Promise<
	T extends true ? BigNumber : ContractTransaction
>;
