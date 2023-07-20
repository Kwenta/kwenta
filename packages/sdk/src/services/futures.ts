import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings'
import Wei, { wei } from '@synthetixio/wei'
import { Contract as EthCallContract } from 'ethcall'
import { ethers } from 'ethers'
import { defaultAbiCoder } from 'ethers/lib/utils'
import request, { gql } from 'graphql-request'
import { orderBy } from 'lodash'

import KwentaSDK from '..'
import { UNSUPPORTED_NETWORK } from '../common/errors'
import { KWENTA_TRACKING_CODE, ORDERS_FETCH_SIZE, SL_TP_MAX_SIZE } from '../constants/futures'
import { Period, PERIOD_IN_HOURS, PERIOD_IN_SECONDS } from '../constants/period'
import { getContractsByNetwork, getPerpsV2MarketMulticall } from '../contracts'
import PerpsMarketABI from '../contracts/abis/PerpsV2Market.json'
import SmartMarginAccountABI from '../contracts/abis/SmartMarginAccount.json'
import PerpsV2MarketInternal from '../contracts/PerpsV2MarketInternalV2'
import { SmartMarginAccount__factory, PerpsV2Market__factory } from '../contracts/types'
import { IPerpsV2MarketConsolidated } from '../contracts/types/PerpsV2Market'
import { IPerpsV2MarketSettings, PerpsV2MarketData } from '../contracts/types/PerpsV2MarketData'
import {
	querySmartMarginAccounts,
	querySmartMarginTransfers,
	queryFuturesTrades,
	queryIsolatedMarginTransfers,
	queryPositionHistory,
	queryTrades,
	queryFundingRateHistory,
} from '../queries/futures'
import { NetworkId, NetworkOverrideOptions } from '../types/common'
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
	AccountExecuteFunctions,
	MarginTransfer,
	MarketWithIdleMargin,
	SmartMarginOrderInputs,
	ConditionalOrderTypeEnum,
	SLTPOrderInputs,
	FuturesMarginType,
	ConditionalOrder,
} from '../types/futures'
import { PricesMap } from '../types/prices'
import { calculateTimestampForPeriod } from '../utils/date'
import {
	calculateFundingRate,
	calculateVolumes,
	ConditionalOrderResult,
	encodeConditionalOrderParams,
	encodeModidyMarketMarginParams,
	encodeSubmitOffchainOrderParams,
	formatDelayedOrder,
	formatPotentialTrade,
	getFuturesEndpoint,
	mapConditionalOrderFromContract,
	mapFuturesPosition,
	mapFuturesPositions,
	mapTrades,
	marketsForNetwork,
	MarketKeyByAsset,
	encodeCloseOffchainOrderParams,
	marginTypeToSubgraphType,
	formatPerpsV2Market,
} from '../utils/futures'
import { getFuturesAggregateStats } from '../utils/subgraph'
import { getReasonFromCode } from '../utils/synths'

export default class FuturesService {
	private sdk: KwentaSDK
	public markets: FuturesMarket[] | undefined
	public internalFuturesMarkets: Partial<
		Record<NetworkId, { [marketAddress: string]: PerpsV2MarketInternal }>
	> = {}

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	get futuresGqlEndpoint() {
		return getFuturesEndpoint(this.sdk.context.networkId)
	}

	/**
	 * @desc Fetches futures markets
	 * @param networkOverride - Network override options
	 * @returns Futures markets array
	 * @example
	 * ```ts
	 * import { KwentaSDK } from '@kwenta/sdk'
	 *
	 * const sdk = new KwentaSDK()
	 * const markets = await sdk.futures.getMarkets()
	 * console.log(markets)
	 * ```
	 */
	public async getMarkets(networkOverride?: NetworkOverrideOptions) {
		const enabledMarkets = marketsForNetwork(
			networkOverride?.networkId || this.sdk.context.networkId,
			this.sdk.context.logError
		)
		const contracts =
			networkOverride && networkOverride?.networkId !== this.sdk.context.networkId
				? getContractsByNetwork(networkOverride.networkId, networkOverride.provider)
				: this.sdk.context.contracts

		const { SystemStatus } = contracts
		const { ExchangeRates, PerpsV2MarketData, PerpsV2MarketSettings } =
			this.sdk.context.multicallContracts

		if (!SystemStatus || !ExchangeRates || !PerpsV2MarketData || !PerpsV2MarketSettings) {
			throw new Error(UNSUPPORTED_NETWORK)
		}

		const futuresData = await this.sdk.context.multicallProvider.all([
			PerpsV2MarketData.allProxiedMarketSummaries(),
			PerpsV2MarketSettings.minInitialMargin(),
			PerpsV2MarketSettings.minKeeperFee(),
		])

		const { markets, minInitialMargin, minKeeperFee } = {
			markets: futuresData[0] as PerpsV2MarketData.MarketSummaryStructOutput[],
			minInitialMargin: futuresData[1] as BigNumber,
			minKeeperFee: futuresData[2] as BigNumber,
		}

		const filteredMarkets = markets.filter((m) => {
			const marketKey = parseBytes32String(m.key) as FuturesMarketKey
			const market = enabledMarkets.find((market) => marketKey === market.key)
			return !!market
		})

		const marketKeys = filteredMarkets.map((m) => m.key)

		const parametersCalls = marketKeys.map((key) => PerpsV2MarketSettings.parameters(key))

		let marketParameters: IPerpsV2MarketSettings.ParametersStructOutput[] = []

		if (this.sdk.context.isMainnet) {
			marketParameters = await this.sdk.context.multicallProvider.all(parametersCalls)
		} else {
			const firstResponses = await this.sdk.context.multicallProvider.all(
				parametersCalls.slice(0, 20)
			)
			const secondResponses = await this.sdk.context.multicallProvider.all(
				parametersCalls.slice(20, parametersCalls.length)
			)
			marketParameters = [
				...firstResponses,
				...secondResponses,
			] as IPerpsV2MarketSettings.ParametersStructOutput[]
		}

		const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(marketKeys)

		const futuresMarkets = filteredMarkets.map((m, i) =>
			formatPerpsV2Market(
				m,
				marketParameters[i],
				{ minKeeperFee: wei(minKeeperFee), minInitialMargin: wei(minInitialMargin) },
				suspensions[i],
				getReasonFromCode(reasons[i]) as MarketClosureReason
			)
		)
		return futuresMarkets
	}

	// TODO: types
	// TODO: Improve the API for fetching positions
	/**
	 *
	 * @param address Smart margin or EOA address
	 * @param futuresMarkets Array of objects with market address, market key, and asset
	 * @returns Array of futures positions associated with the given address
	 */
	public async getFuturesPositions(
		address: string, // Smart margin or EOA address
		futuresMarkets: { asset: FuturesMarketAsset; marketKey: FuturesMarketKey; address: string }[]
	) {
		const marketDataContract = this.sdk.context.multicallContracts.PerpsV2MarketData

		if (!this.sdk.context.isL2 || !marketDataContract) {
			throw new Error(UNSUPPORTED_NETWORK)
		}

		const positionCalls = []
		const liquidationCalls = []

		for (const { address: marketAddress, marketKey } of futuresMarkets) {
			positionCalls.push(
				marketDataContract.positionDetailsForMarketKey(formatBytes32String(marketKey), address)
			)
			const marketContract = new EthCallContract(marketAddress, PerpsMarketABI)
			liquidationCalls.push(marketContract.canLiquidate(address))
		}

		// TODO: Combine these two?
		const positionDetails = (await this.sdk.context.multicallProvider.all(
			positionCalls
		)) as PositionDetail[]
		const canLiquidateState = (await this.sdk.context.multicallProvider.all(
			liquidationCalls
		)) as boolean[]

		// map the positions using the results
		const positions = positionDetails.map((position, i) => {
			const canLiquidate = canLiquidateState[i]
			const { marketKey, asset } = futuresMarkets[i]

			return mapFuturesPosition(position, canLiquidate, asset, marketKey)
		})

		return positions
	}

	/**
	 * @desc Get the funding rate history for a given market
	 * @param marketAsset Futures market asset
	 * @param periodLength Period length in seconds
	 * @returns Funding rate history for the given market
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const fundingRateHistory = await sdk.futures.getMarketFundingRatesHistory('ETH')
	 * console.log(fundingRateHistory)
	 * ```
	 */
	public async getMarketFundingRatesHistory(
		marketAsset: FuturesMarketAsset,
		periodLength = PERIOD_IN_SECONDS.TWO_WEEKS
	) {
		const minTimestamp = Math.floor(Date.now() / 1000) - periodLength
		return queryFundingRateHistory(this.sdk, marketAsset, minTimestamp)
	}

	/**
	 * @desc Get the average funding rates for the given markets
	 * @param markets Futures markets array
	 * @param prices Prices map
	 * @param period Period enum member
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const markets = await sdk.futures.getMarkets()
	 * const prices =
	 * const fundingRates = await sdk.synths.getAverageFundingRates(markets, prices, Period.ONE_DAY)
	 * console.log(fundingRates)
	 * ```
	 */
	public async getAverageFundingRates(markets: FuturesMarket[], prices: PricesMap, period: Period) {
		const fundingRateInputs: FundingRateInput[] = markets.map(
			({ asset, market, currentFundingRate }) => {
				const price = prices[asset]
				return {
					marketAddress: market,
					marketKey: MarketKeyByAsset[asset],
					price,
					currentFundingRate,
				}
			}
		)

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
				`
		})
		const periodLength = PERIOD_IN_SECONDS[period]
		const minTimestamp = Math.floor(Date.now() / 1000) - periodLength

		const marketFundingResponses: Record<string, FundingRateUpdate[]> = await request(
			this.futuresGqlEndpoint,
			gql`
			query fundingRateUpdates($minTimestamp: BigInt!) {
				${fundingRateQueries.reduce((acc, curr) => acc + curr)}
			}
		`,
			{ minTimestamp }
		)

		const periodTitle = period === Period.ONE_HOUR ? '1H Funding Rate' : 'Funding Rate'

		const fundingRateResponses = fundingRateInputs.map(
			({ marketKey, currentFundingRate, price }) => {
				if (!price) return null
				const marketResponses = [
					marketFundingResponses[`${marketKey}_first`],
					marketFundingResponses[`${marketKey}_next`],
					marketFundingResponses[`${marketKey}_latest`],
				]

				const responseFilt = marketResponses
					.filter((value) => value.length > 0)
					.map((entry) => entry[0])
					.sort((a, b) => a.timestamp - b.timestamp)

				const fundingRate =
					responseFilt && !!currentFundingRate
						? calculateFundingRate(
								minTimestamp,
								periodLength,
								responseFilt,
								price,
								currentFundingRate
						  )
						: currentFundingRate ?? null

				const fundingPeriod =
					responseFilt && !!currentFundingRate ? periodTitle : 'Inst. Funding Rate'

				const fundingRateResponse: FundingRateResponse = {
					asset: marketKey,
					fundingTitle: fundingPeriod,
					fundingRate,
				}
				return fundingRateResponse
			}
		)

		return fundingRateResponses.filter((funding): funding is FundingRateResponse => !!funding)
	}

	/**
	 * @desc Get the daily volumes for all markets
	 * @returns Object with the daily number of trades and volumes for all markets
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const dailyVolumes = await sdk.futures.getDailyVolumes()
	 * console.log(dailyVolumes)
	 * ```
	 */
	public async getDailyVolumes(): Promise<FuturesVolumes> {
		const minTimestamp = Math.floor(calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY) / 1000)
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
		)
		return response ? calculateVolumes(response) : {}
	}

	/**
	 * @desc Get the smart margin accounts associated with a given wallet address
	 * @param walletAddress Wallet address
	 * @returns Array of smart margin account addresses
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const accounts = await sdk.futures.getSmartMarginAccounts()
	 * console.log(accounts)
	 * ```
	 */
	public async getSmartMarginAccounts(walletAddress?: string | null): Promise<string[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return await querySmartMarginAccounts(this.sdk, address)
	}

	/**
	 * @desc Get isolated margin transfer history for a given wallet address
	 * @param walletAddress Wallet address
	 * @returns Array of past isolated margin transfers for the given wallet address
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const transfers = await sdk.futures.getIsolatedMarginTransfers()
	 * console.log(transfers)
	 * ```
	 */
	public async getIsolatedMarginTransfers(
		walletAddress?: string | null
	): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return queryIsolatedMarginTransfers(this.sdk, address)
	}

	/**
	 * @desc Get smart margin transfer history for a given wallet address
	 * @param walletAddress Wallet address
	 * @returns Array of past smart margin transfers for the given wallet address
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const transfers = await sdk.futures.getSmartMarginTransfers()
	 * console.log(transfers)
	 * ```
	 */
	public async getSmartMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return querySmartMarginTransfers(this.sdk, address)
	}

	/**
	 * @desc Get the balance of a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @returns Balance of the given smart margin account
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const balance = await sdk.futures.getSmartMarginAccountBalance('0x...')
	 * console.log(balance)
	 * ```
	 */
	public async getSmartMarginAccountBalance(smartMarginAddress: string) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.provider
		)

		const freeMargin = await smartMarginAccountContract.freeMargin()
		return wei(freeMargin)
	}

	/**
	 * @desc Get important balances for a given smart margin account and wallet address.
	 * @param walletAddress Wallet address
	 * @param smartMarginAddress Smart margin account address
	 * @returns Free margin and keeper balance (in ETH) for given smart margin address, as well as the wallet balance (in ETH), and sUSD allowance for the given wallet address.
	 */
	public async getSmartMarginBalanceInfo(walletAddress: string, smartMarginAddress: string) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.provider
		)
		const { SUSD } = this.sdk.context.contracts
		if (!SUSD) throw new Error(UNSUPPORTED_NETWORK)

		// TODO: EthCall
		const [freeMargin, keeperEthBal, walletEthBal, allowance] = await Promise.all([
			smartMarginAccountContract.freeMargin(),
			this.sdk.context.provider.getBalance(smartMarginAddress),
			this.sdk.context.provider.getBalance(walletAddress),
			SUSD.allowance(walletAddress, smartMarginAccountContract.address),
		])

		return {
			freeMargin: wei(freeMargin),
			keeperEthBal: wei(keeperEthBal),
			walletEthBal: wei(walletEthBal),
			allowance: wei(allowance),
		}
	}

	/**
	 * @desc Get the conditional orders created by a given smart margin account
	 * @param account Smart margin account address
	 * @returns Array of conditional orders created by the given smart margin account
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const orders = await sdk.futures.getConditionalOrders('0x...')
	 * console.log(orders)
	 * ```
	 */
	public async getConditionalOrders(account: string) {
		const smartMarginAccountMultiCall = new EthCallContract(account, SmartMarginAccountABI)
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			account,
			this.sdk.context.provider
		)

		const orders = []

		const orderIdBigNum = await smartMarginAccountContract.conditionalOrderId()
		const orderId = orderIdBigNum.toNumber()
		// Limit to the latest 500
		const start = orderId > ORDERS_FETCH_SIZE ? orderId - ORDERS_FETCH_SIZE : 0

		const orderCalls = Array(orderId)
			.fill(0)
			.map((_, i) => smartMarginAccountMultiCall.getConditionalOrder(start + i))
		const contractOrders = (await this.sdk.context.multicallProvider.all(
			orderCalls
		)) as ConditionalOrderResult[]

		for (let i = 0; i < orderId; i++) {
			const contractOrder = contractOrders[i]
			// Checks if the order is still pending
			// Orders are never removed but all values set to zero so we check a zero value on price to filter pending
			if (contractOrder && contractOrder.targetPrice.gt(0)) {
				const order = mapConditionalOrderFromContract({ ...contractOrder, id: start + i }, account)
				orders.push(order)
			}
		}

		return orderBy(orders, ['id'], 'desc')
	}

	// Perps V2 read functions

	/**
	 * @desc Get delayed orders associated with a given wallet address, for a specific market
	 * @param account Wallet address
	 * @param marketAddress Array of futures market addresses
	 * @returns Delayed order for the given market address, associated with the given wallet address
	 */
	public async getDelayedOrder(account: string, marketAddress: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider)
		const order = await market.delayedOrders(account)
		return formatDelayedOrder(account, marketAddress, order)
	}

	/**
	 * @desc Get delayed orders associated with a given wallet address
	 * @param account Wallet address
	 * @param marketAddresses Array of futures market addresses
	 * @returns Array of delayed orders for the given market addresses, associated with the given wallet address
	 */
	public async getDelayedOrders(account: string, marketAddresses: string[]) {
		const marketContracts = marketAddresses.map(getPerpsV2MarketMulticall)

		const orders = (await this.sdk.context.multicallProvider.all(
			marketContracts.map((market) => market.delayedOrders(account))
		)) as IPerpsV2MarketConsolidated.DelayedOrderStructOutput[]

		return orders.map((order, i) => formatDelayedOrder(account, marketAddresses[i], order))
	}

	/**
	 * @desc Generate a trade preview for a potential trade with an isolated margin account.
	 * @param marketAddress Futures market address
	 * @param marketKey Futures market key
	 * @param orderType Order type (market, delayed, delayed offchain)
	 * @param inputs Object containing size delta, order price, and leverage side
	 * @returns Object containing details about the potential trade
	 */
	public async getIsolatedMarginTradePreview(
		marketAddress: string,
		marketKey: FuturesMarketKey,
		orderType: ContractOrderType,
		inputs: {
			sizeDelta: Wei
			price: Wei
			leverageSide: PositionSide
		}
	) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider)
		const details = await market.postTradeDetails(
			inputs.sizeDelta.toBN(),
			inputs.price.toBN(),
			orderType,
			this.sdk.context.walletAddress
		)

		const skewAdjustedPrice = await this.getSkewAdjustedPrice(
			inputs.price,
			marketAddress,
			marketKey
		)

		return formatPotentialTrade(details, skewAdjustedPrice, inputs.sizeDelta, inputs.leverageSide)
	}

	/**
	 * @desc Generate a trade preview for a potential trade with a smart margin account.
	 * @param smartMarginAccount Smart margin account address
	 * @param marketKey Futures market key
	 * @param marketAddress Futures market address
	 * @param tradeParams Object containing size delta, margin delta, order price, and leverage side
	 * @returns Object containing details about the potential trade
	 */
	public async getSmartMarginTradePreview(
		smartMarginAccount: string,
		marketKey: FuturesMarketKey,
		marketAddress: string,
		tradeParams: {
			sizeDelta: Wei
			marginDelta: Wei
			orderPrice: Wei
			leverageSide: PositionSide
		}
	) {
		const marketInternal = this.getInternalFuturesMarket(marketAddress, marketKey)

		const preview = await marketInternal.getTradePreview(
			smartMarginAccount,
			tradeParams.sizeDelta.toBN(),
			tradeParams.marginDelta.toBN(),
			tradeParams.orderPrice.toBN()
		)

		const skewAdjustedPrice = await this.getSkewAdjustedPrice(
			tradeParams.orderPrice,
			marketAddress,
			marketKey
		)

		return formatPotentialTrade(
			preview,
			skewAdjustedPrice,
			tradeParams.sizeDelta,
			tradeParams.leverageSide
		)
	}

	/**
	 * @desc Get futures positions history for a given wallet address or smart margin account
	 * @param address Wallet address or smart margin account address
	 * @param addressType Address type (EOA or smart margin account)
	 * @returns Array of historical futures positions associated with the given address
	 */
	public async getPositionHistory(address: string, addressType: 'eoa' | 'account' = 'account') {
		const response = await queryPositionHistory(this.sdk, address, addressType)
		return response ? mapFuturesPositions(response) : []
	}

	// TODO: Support pagination

	/**
	 * @desc Get the trade history for a given account on a specific market
	 * @param marketAsset Market asset
	 * @param walletAddress Account address
	 * @param accountType Account type (smart or isolated)
	 * @param pageLength Number of trades to fetch
	 * @returns Array of trades for the account on the given market.
	 */
	public async getTradesForMarket(
		marketAsset: FuturesMarketAsset,
		walletAddress: string,
		accountType: FuturesMarginType,
		pageLength: number = 16
	) {
		const response = await queryTrades(this.sdk, {
			marketAsset,
			walletAddress,
			accountType: marginTypeToSubgraphType(accountType),
			pageLength,
		})
		return response ? mapTrades(response) : []
	}

	/**
	 * @desc Get the trade history for a given account
	 * @param walletAddress Account address
	 * @param accountType Account type (smart or isolated)
	 * @param pageLength Number of trades to fetch
	 * @returns Array of trades for the account on the given market.
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const trades = await sdk.futures.getAllTrades('0x...', FuturesMarginType.SMART_MARGIN)
	 * console.log(trades)
	 * ```
	 */
	public async getAllTrades(
		walletAddress: string,
		accountType: FuturesMarginType,
		pageLength: number = 16
	) {
		const response = await queryTrades(this.sdk, {
			walletAddress,
			accountType: marginTypeToSubgraphType(accountType),
			pageLength,
		})
		return response ? mapTrades(response) : []
	}

	/**
	 * @desc Get the idle margin in futures markets
	 * @param accountOrEoa Wallet address or smart margin account address
	 * @returns Total idle margin in markets and an array of markets with idle margin
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const idleMargin = await sdk.futures.getIdleMargin('0x...')
	 * console.log(idleMargin)
	 * ```
	 */
	public async getIdleMarginInMarkets(accountOrEoa: string) {
		const markets = this.markets ?? (await this.getMarkets())
		const filteredMarkets: FuturesMarket[] = []

		const marketParams: {
			asset: FuturesMarketAsset
			marketKey: FuturesMarketKey
			address: string
		}[] = []

		markets.forEach((m) => {
			if (!m.isSuspended) {
				filteredMarkets.push(m)
				marketParams.push({ asset: m.asset, marketKey: m.marketKey, address: m.market })
			}
		})

		const positions = await this.getFuturesPositions(accountOrEoa, marketParams)

		return positions.reduce(
			(acc, p) => {
				if (p.position?.size.abs().gt(0)) {
					acc.totalIdleInMarkets = acc.totalIdleInMarkets.add(p.position.size)
				}

				const market = filteredMarkets.find((m) => m.marketKey === p.marketKey)

				if (market) {
					acc.marketsWithIdleMargin.push({
						marketAddress: market.market,
						marketKey: market.marketKey,
						position: p,
					})
				}

				return acc
			},
			{ totalIdleInMarkets: wei(0), marketsWithIdleMargin: [] as MarketWithIdleMargin[] }
		)
	}

	/**
	 * @desc Get idle margin for given wallet address or smart margin account address
	 * @param eoa Wallet address
	 * @param account Smart margin account address
	 * @returns Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const idleMargin = await sdk.futures.getIdleMargin('0x...')
	 * console.log(idleMargin)
	 * ```
	 */
	public async getIdleMargin(eoa: string, account?: string) {
		const idleMargin = await this.getIdleMarginInMarkets(account || eoa)

		const { susdWalletBalance } = await this.sdk.synths.getSynthBalances(eoa)
		return {
			total: idleMargin.totalIdleInMarkets.add(susdWalletBalance),
			marketsTotal: idleMargin.totalIdleInMarkets,
			walletTotal: susdWalletBalance,
			marketsWithMargin: idleMargin.marketsWithIdleMargin,
		}
	}

	// This is on an interval of 15 seconds.
	public async getFuturesTrades(marketKey: FuturesMarketKey, minTs: number, maxTs: number) {
		const response = await queryFuturesTrades(this.sdk, marketKey, minTs, maxTs)
		return response ? mapTrades(response) : null
	}

	// TODO: Get delayed order fee
	public async getOrderFee(marketAddress: string, size: Wei) {
		const marketContract = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const orderFee = await marketContract.orderFee(size.toBN(), 0)
		return wei(orderFee.fee)
	}

	// Contract mutations

	/**
	 * @desc Approve a smart margin account deposit
	 * @param smartMarginAddress Smart margin account address
	 * @param amount Amount to approve
	 * @returns ethers.js TransactionResponse object
	 */
	public async approveSmartMarginDeposit(
		smartMarginAddress: string,
		amount: BigNumber = BigNumber.from(ethers.constants.MaxUint256)
	) {
		if (!this.sdk.context.contracts.SUSD) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.SUSD, 'approve', [
			smartMarginAddress,
			amount,
		])
	}

	/**
	 * @desc Deposit sUSD into a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @param amount Amount to deposit
	 * @returns ethers.js TransactionResponse object
	 */
	public async depositSmartMarginAccount(smartMarginAddress: string, amount: Wei) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN],
			[defaultAbiCoder.encode(['int256'], [amount.toBN()])],
		])
	}

	/**
	 * @desc Withdraw sUSD from a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @param amount Amount to withdraw
	 * @returns ethers.js TransactionResponse object
	 */
	public async withdrawSmartMarginAccount(smartMarginAddress: string, amount: Wei) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		const { commands, inputs } = await this.batchIdleMarketMarginSweeps(smartMarginAddress)

		commands.push(AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN)
		inputs.push(defaultAbiCoder.encode(['int256'], [amount.neg().toBN()]))
		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])
	}

	/**
	 * @desc Modify the margin for a specific market in a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @param marketAddress Market address
	 * @param marginDelta Amount to modify the margin by (can be positive or negative)
	 * @returns ethers.js TransactionResponse object
	 */
	public async modifySmartMarginMarketMargin(
		smartMarginAddress: string,
		marketAddress: string,
		marginDelta: Wei
	) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		const commands = []
		const inputs = []

		if (marginDelta.gt(0)) {
			const freeMargin = await this.getSmartMarginAccountBalance(smartMarginAddress)
			if (marginDelta.gt(freeMargin)) {
				// Margin delta bigger than account balance,
				// need to pull some from the users wallet or idle margin
				const {
					commands: sweepCommands,
					inputs: sweepInputs,
					idleMargin,
				} = await this.batchIdleMarketMarginSweeps(smartMarginAddress)

				commands.push(...sweepCommands)
				inputs.push(...sweepInputs)

				const totalFreeMargin = idleMargin.totalIdleInMarkets.add(freeMargin)
				const depositAmount = marginDelta.gt(totalFreeMargin)
					? marginDelta.sub(totalFreeMargin).abs()
					: wei(0)
				if (depositAmount.gt(0)) {
					// If we don't have enough from idle market margin then we pull from the wallet
					commands.push(AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN)
					inputs.push(defaultAbiCoder.encode(['int256'], [depositAmount.toBN()]))
				}
			}
		}

		commands.push(AccountExecuteFunctions.PERPS_V2_MODIFY_MARGIN)
		inputs.push(encodeModidyMarketMarginParams(marketAddress, marginDelta))

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])
	}

	/**
	 * @desc Modify the position size for a specific market in a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @param market Object containing the market key and address
	 * @param sizeDelta Intended size change (positive or negative)
	 * @param desiredFillPrice Desired fill price
	 * @param cancelPendingReduceOrders Boolean describing if pending reduce orders should be cancelled
	 * @returns ethers.js TransactionResponse object
	 */
	public async modifySmartMarginPositionSize(
		smartMarginAddress: string,
		market: { key: FuturesMarketKey; address: string },
		sizeDelta: Wei,
		desiredFillPrice: Wei,
		cancelPendingReduceOrders?: boolean
	) {
		const commands = []
		const inputs = []

		if (cancelPendingReduceOrders) {
			const existingOrders = await this.getConditionalOrders(smartMarginAddress)

			existingOrders.forEach((o) => {
				// Remove all pending reduce only orders if instructed
				if (o.marketKey === market.key && o.reduceOnly) {
					commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
					inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
				}
			})
		}

		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER)
		inputs.push(encodeSubmitOffchainOrderParams(market.address, sizeDelta, desiredFillPrice))

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])
	}

	/**
	 * @desc Deposit margin for use in an isolated margin market
	 * @param marketAddress Market address
	 * @param amount Amount to deposit
	 * @returns ethers.js TransactionResponse object
	 */
	public async depositIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [amount.toBN()])
		return txn
	}

	/**
	 * @desc Withdraw margin from an isolated margin market
	 * @param marketAddress Market address
	 * @param amount Amount to withdraw
	 * @returns ethers.js TransactionResponse object
	 */
	public async withdrawIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [
			amount.neg().toBN(),
		])
		return txn
	}

	/**
	 * @desc Close an open position in an isolated margin market
	 * @param marketAddress Market address
	 * @param priceImpactDelta Price impact delta
	 * @returns ethers.js ContractTransaction object
	 */
	public async closeIsolatedPosition(marketAddress: string, priceImpactDelta: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		return market.closePositionWithTracking(priceImpactDelta.toBN(), KWENTA_TRACKING_CODE)
	}

	/**
	 * @desc Get idle margin for given wallet address or smart margin account address
	 * @param eoa Wallet address
	 * @param account Smart margin account address
	 * @returns Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const idleMargin = await sdk.futures.getIdleMargin('0x...')
	 * console.log(idleMargin)
	 * ```
	 */
	public async submitIsolatedMarginOrder(
		marketAddress: string,
		sizeDelta: Wei,
		priceImpactDelta: Wei
	) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)

		return this.sdk.transactions.createContractTxn(
			market,
			'submitOffchainDelayedOrderWithTracking',
			[sizeDelta.toBN(), priceImpactDelta.toBN(), KWENTA_TRACKING_CODE]
		)
	}

	/**
	 * @desc Cancels a pending/expired delayed order, for the given market and account
	 * @param marketAddress Market address
	 * @param account Wallet address
	 * @param isOffchain Boolean describing if the order is offchain or not
	 * @returns ethers.js ContractTransaction object
	 */
	public async cancelDelayedOrder(marketAddress: string, account: string, isOffchain: boolean) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		return isOffchain
			? market.cancelOffchainDelayedOrder(account)
			: market.cancelDelayedOrder(account)
	}

	/**
	 * @desc Executes a pending delayed order, for the given market and account
	 * @param marketAddress Market address
	 * @param account Wallet address
	 * @returns ethers.js ContractTransaction object
	 */
	public async executeDelayedOrder(marketAddress: string, account: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		return market.executeDelayedOrder(account)
	}

	public async executeDelayedOffchainOrder(
		marketKey: FuturesMarketKey,
		marketAddress: string,
		account: string
	) {
		const { Pyth } = this.sdk.context.contracts
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		if (!Pyth) throw new Error(UNSUPPORTED_NETWORK)

		// get price update data
		const priceUpdateData = await this.sdk.prices.getPythPriceUpdateData(marketKey)
		const updateFee = await Pyth.getUpdateFee(priceUpdateData)

		return market.executeOffchainDelayedOrder(account, priceUpdateData, { value: updateFee })
	}

	/**
	 * @desc Creates a smart margin account
	 * @returns ethers.js TransactionResponse object
	 */
	public async createSmartMarginAccount() {
		if (!this.sdk.context.contracts.SmartMarginAccountFactory) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.SmartMarginAccountFactory,
			'newAccount',
			[]
		)
	}

	/**
	 * @desc Get idle margin for given wallet address or smart margin account address
	 * @param eoa Wallet address
	 * @param account Smart margin account address
	 * @returns Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const idleMargin = await sdk.futures.getIdleMargin('0x...')
	 * console.log(idleMargin)
	 * ```
	 */
	public async submitSmartMarginOrder(
		market: { key: FuturesMarketKey; address: string },
		walletAddress: string,
		smartMarginAddress: string,
		order: SmartMarginOrderInputs,
		options?: {
			cancelPendingReduceOrders?: boolean
			cancelExpiredDelayedOrders?: boolean
		}
	) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)
		const commands = []
		const inputs = []

		if (options?.cancelExpiredDelayedOrders) {
			commands.push(AccountExecuteFunctions.PERPS_V2_CANCEL_OFFCHAIN_DELAYED_ORDER)
			inputs.push(defaultAbiCoder.encode(['address'], [market.address]))
		}

		const [idleMargin, freeMargin] = await Promise.all([
			this.getIdleMargin(walletAddress, smartMarginAddress),
			this.getSmartMarginAccountBalance(smartMarginAddress),
		])

		// Sweep idle margin from other markets to account
		if (idleMargin.marketsTotal.gt(0)) {
			idleMargin.marketsWithMargin.forEach((m) => {
				commands.push(AccountExecuteFunctions.PERPS_V2_WITHDRAW_ALL_MARGIN)
				inputs.push(defaultAbiCoder.encode(['address'], [m.marketAddress]))
			})
		}

		if (order.marginDelta.gt(0)) {
			const totalFreeMargin = freeMargin.add(idleMargin.marketsTotal)
			const depositAmount = order.marginDelta.gt(totalFreeMargin)
				? order.marginDelta.sub(totalFreeMargin).abs()
				: wei(0)
			if (depositAmount.gt(0)) {
				// If there's not enough idle margin to cover the margin delta we pull it from the wallet
				commands.push(AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN)
				inputs.push(defaultAbiCoder.encode(['int256'], [depositAmount.toBN()]))
			}
		}

		if (order.sizeDelta.abs().gt(0)) {
			if (!order.conditionalOrderInputs) {
				commands.push(AccountExecuteFunctions.PERPS_V2_MODIFY_MARGIN)
				inputs.push(encodeModidyMarketMarginParams(market.address, order.marginDelta))
				commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER)
				inputs.push(
					encodeSubmitOffchainOrderParams(market.address, order.sizeDelta, order.desiredFillPrice)
				)
			} else {
				commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER)
				const params = encodeConditionalOrderParams(
					market.key,
					{
						marginDelta: order.marginDelta,
						sizeDelta: order.sizeDelta,
						price: order.conditionalOrderInputs!.price,
						desiredFillPrice: order.desiredFillPrice,
					},
					order.conditionalOrderInputs.orderType,
					order.conditionalOrderInputs!.reduceOnly
				)
				inputs.push(params)
			}
		}

		if (order.takeProfit || order.stopLoss) {
			if (order.takeProfit) {
				commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER)
				const encodedParams = encodeConditionalOrderParams(
					market.key,
					{
						marginDelta: wei(0),
						sizeDelta: order.takeProfit.sizeDelta,
						price: order.takeProfit.price,
						desiredFillPrice: order.takeProfit.desiredFillPrice,
					},
					ConditionalOrderTypeEnum.LIMIT,
					true
				)
				inputs.push(encodedParams)
			}

			if (order.stopLoss) {
				commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER)
				const encodedParams = encodeConditionalOrderParams(
					market.key,
					{
						marginDelta: wei(0),
						sizeDelta: order.stopLoss.sizeDelta,
						price: order.stopLoss.price,
						desiredFillPrice: order.stopLoss.desiredFillPrice,
					},
					ConditionalOrderTypeEnum.STOP,
					true
				)
				inputs.push(encodedParams)
			}
		}

		const existingOrders = await this.getConditionalOrders(smartMarginAddress)
		const existingOrdersForMarket = existingOrders.filter(
			(o) => o.marketKey === market.key && o.reduceOnly
		)

		if (options?.cancelPendingReduceOrders) {
			// Remove all pending reduce only orders if instructed
			existingOrdersForMarket.forEach((o) => {
				commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
				inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
			})
		} else {
			if (order.takeProfit) {
				// Remove only existing take profit to overwrite
				const existingTakeProfits = existingOrdersForMarket.filter(
					(o) => o.size.abs().eq(SL_TP_MAX_SIZE) && o.orderType === ConditionalOrderTypeEnum.LIMIT
				)
				if (existingTakeProfits.length) {
					existingTakeProfits.forEach((tp) => {
						commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
						inputs.push(defaultAbiCoder.encode(['uint256'], [tp.id]))
					})
				}
			}
			if (order.stopLoss) {
				// Remove only existing stop loss to overwrite
				const existingStopLosses = existingOrdersForMarket.filter(
					(o) => o.size.abs().eq(SL_TP_MAX_SIZE) && o.orderType === ConditionalOrderTypeEnum.STOP
				)
				if (existingStopLosses.length) {
					existingStopLosses.forEach((sl) => {
						commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
						inputs.push(defaultAbiCoder.encode(['uint256'], [sl.id]))
					})
				}
			}
		}

		return this.sdk.transactions.createContractTxn(
			smartMarginAccountContract,
			'execute',
			[commands, inputs],
			{ value: order.keeperEthDeposit?.toBN() ?? '0' }
		)
	}

	/**
	 * @desc Closes a smart margin position
	 * @param market Object containing market address and key
	 * @param smartMarginAddress Smart margin account address
	 * @param desiredFillPrice Desired fill price
	 * @returns ethers.js TransactionResponse object
	 */
	public async closeSmartMarginPosition(
		market: {
			address: string
			key: FuturesMarketKey
		},
		smartMarginAddress: string,
		desiredFillPrice: Wei
	) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		const commands = []
		const inputs = []

		const existingOrders = await this.getConditionalOrders(smartMarginAddress)

		existingOrders.forEach((o) => {
			if (o.marketKey === market.key && o.reduceOnly) {
				commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
				inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
			}
		})

		commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_CLOSE_OFFCHAIN_DELAYED_ORDER)
		inputs.push(encodeCloseOffchainOrderParams(market.address, desiredFillPrice))

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])
	}

	/**
	 * @desc Cancels a conditional order
	 * @param smartMarginAddress Smart margin account address
	 * @param orderId Conditional order id
	 * @returns ethers.js TransactionResponse object
	 */
	public async cancelConditionalOrder(smartMarginAddress: string, orderId: number) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER],
			[defaultAbiCoder.encode(['uint256'], [orderId])],
		])
	}

	/**
	 * @desc Withdraws given smarkt margin account's keeper balance
	 * @param smartMarginAddress Smart margin account address
	 * @param amount Amount to withdraw
	 * @returns ethers.js TransactionResponse object
	 */
	public async withdrawAccountKeeperBalance(smartMarginAddress: string, amount: Wei) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.ACCOUNT_WITHDRAW_ETH],
			[defaultAbiCoder.encode(['uint256'], [amount.toBN()])],
		])
	}

	/**
	 * @desc Updates the stop loss and take profit values for a given smart margin account, based on the specified market.
	 * @param marketKey Market key
	 * @param smartMarginAddress Smart margin account address
	 * @param params Object containing the stop loss and take profit values
	 * @returns ethers.js TransactionResponse object
	 */
	public async updateStopLossAndTakeProfit(
		marketKey: FuturesMarketKey,
		smartMarginAddress: string,
		params: SLTPOrderInputs
	) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)
		const commands = []
		const inputs = []

		if (params.takeProfit || params.stopLoss) {
			const existingOrders = await this.getConditionalOrders(smartMarginAddress)
			const existingStopLosses: ConditionalOrder[] = []
			const existingTakeProfits: ConditionalOrder[] = []

			existingOrders.forEach((o) => {
				if (o.marketKey === marketKey && o.size.abs().eq(SL_TP_MAX_SIZE) && o.reduceOnly) {
					if (o.orderType === ConditionalOrderTypeEnum.STOP) {
						existingStopLosses.push(o)
					} else if (o.orderType === ConditionalOrderTypeEnum.LIMIT) {
						existingTakeProfits.push(o)
					}
				}
			})

			if (params.takeProfit) {
				if (existingTakeProfits.length) {
					existingTakeProfits.forEach((tp) => {
						commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
						inputs.push(defaultAbiCoder.encode(['uint256'], [tp.id]))
					})
				}
				if (!params.takeProfit.isCancelled) {
					commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER)
					const encodedParams = encodeConditionalOrderParams(
						marketKey,
						{
							marginDelta: wei(0),
							sizeDelta: params.takeProfit.sizeDelta,
							price: params.takeProfit.price,
							desiredFillPrice: params.takeProfit.desiredFillPrice,
						},
						ConditionalOrderTypeEnum.LIMIT,
						true
					)
					inputs.push(encodedParams)
				}
			}

			if (params.stopLoss) {
				if (existingStopLosses.length) {
					existingStopLosses.forEach((sl) => {
						commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
						inputs.push(defaultAbiCoder.encode(['uint256'], [sl.id]))
					})
				}
				if (!params.stopLoss.isCancelled) {
					commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER)
					const encodedParams = encodeConditionalOrderParams(
						marketKey,
						{
							marginDelta: wei(0),
							sizeDelta: params.stopLoss.sizeDelta,
							price: params.stopLoss.price,
							desiredFillPrice: params.stopLoss.desiredFillPrice,
						},
						ConditionalOrderTypeEnum.STOP,
						true
					)
					inputs.push(encodedParams)
				}
			}
		}

		return this.sdk.transactions.createContractTxn(
			smartMarginAccountContract,
			'execute',
			[commands, inputs],
			{ value: params.keeperEthDeposit?.toBN() ?? '0' }
		)
	}

	/**
	 * @desc Adjusts the given price, based on the current market skew.
	 * @param price Price to adjust
	 * @param marketAddress Market address
	 * @param marketKey Market key
	 * @returns Adjusted price, based on the given market's skew.
	 */
	public async getSkewAdjustedPrice(price: Wei, marketAddress: string, marketKey: string) {
		const marketContract = new EthCallContract(marketAddress, PerpsMarketABI)
		const { PerpsV2MarketSettings } = this.sdk.context.multicallContracts
		if (!PerpsV2MarketSettings) throw new Error(UNSUPPORTED_NETWORK)

		const [marketSkew, skewScale] = await this.sdk.context.multicallProvider.all([
			marketContract.marketSkew(),
			PerpsV2MarketSettings.skewScale(formatBytes32String(marketKey)),
		])

		const skewWei = wei(marketSkew)
		const scaleWei = wei(skewScale)

		return price.mul(skewWei.div(scaleWei).add(1))
	}

	// Private methods

	private getInternalFuturesMarket(marketAddress: string, marketKey: FuturesMarketKey) {
		let market = this.internalFuturesMarkets[this.sdk.context.networkId]?.[marketAddress]
		if (market) return market
		market = new PerpsV2MarketInternal(
			this.sdk,
			this.sdk.context.provider,
			marketKey,
			marketAddress
		)
		this.internalFuturesMarkets = {
			[this.sdk.context.networkId]: {
				...this.internalFuturesMarkets[this.sdk.context.networkId],
				[marketAddress]: market,
			},
		}

		return market
	}

	private async batchIdleMarketMarginSweeps(smartMarginAddress: string) {
		const idleMargin = await this.getIdleMarginInMarkets(smartMarginAddress)
		const commands: number[] = []
		const inputs: string[] = []
		// Sweep idle margin from other markets to account
		if (idleMargin.totalIdleInMarkets.gt(0)) {
			idleMargin.marketsWithIdleMargin.forEach((m) => {
				commands.push(AccountExecuteFunctions.PERPS_V2_WITHDRAW_ALL_MARGIN)
				inputs.push(defaultAbiCoder.encode(['address'], [m.marketAddress]))
			})
		}

		return { commands, inputs, idleMargin }
	}
}
