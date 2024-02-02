import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings'
import Wei, { wei } from '@synthetixio/wei'
import { Contract as EthCallContract } from 'ethcall'
import { ethers } from 'ethers'
import { defaultAbiCoder } from 'ethers/lib/utils'
import request, { gql } from 'graphql-request'
import { orderBy } from 'lodash'
import axios from 'axios'

import KwentaSDK from '..'
import { UNSUPPORTED_NETWORK } from '../common/errors'
import {
	KWENTA_TRACKING_CODE,
	LOW_FEE_TIER_BYTES,
	ORDERS_FETCH_SIZE,
	SL_TP_MAX_SIZE,
} from '../constants/futures'
import { Period, PERIOD_IN_HOURS, PERIOD_IN_SECONDS } from '../constants/period'
import { getContractsByNetwork, getPerpsV2MarketMulticall } from '../contracts'
import PerpsMarketABI from '../contracts/abis/PerpsV2Market.json'
import SmartMarginAccountABI from '../contracts/abis/SmartMarginAccount.json'
import PerpsV2MarketInternal from '../contracts/PerpsV2MarketInternalV2'
import { PerpsV2Market__factory, SmartMarginAccount__factory } from '../contracts/types'
import { IPerpsV2MarketConsolidated } from '../contracts/types/PerpsV2Market'
import { IPerpsV2MarketSettings, PerpsV2MarketData } from '../contracts/types/PerpsV2MarketData'
import {
	queryFundingRateHistory,
	queryFuturesTrades,
	queryIsolatedMarginTransfers,
	queryPositionHistory,
	querySmartMarginAccounts,
	querySmartMarginAccountTransfers,
	queryTrades,
} from '../queries/futures'
import { NetworkId, NetworkOverrideOptions, TxReturn } from '../types/common'
import {
	AccountExecuteFunctions,
	ApproveSmartMarginDepositParams,
	CancelConditionalOrderParams,
	CancelDelayedOrderParams,
	ChangeMarketBalanceParams,
	CloseIsolatedPositionParams,
	CloseSmartMarginPositionParams,
	ConditionalOrder,
	ConditionalOrderTypeEnum,
	ExecuteDelayedOffchainOrderParams,
	ExecuteDelayedOrderParams,
	FundingRateInput,
	FundingRateResponse,
	FundingRateUpdate,
	FuturesMarginType,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesVolumes,
	GetIsolatedMarginTradePreviewParams,
	GetSkewAdjustedPriceParams,
	GetSmartMarginTradePreviewParams,
	MarginTransfer,
	Market,
	MarketClosureReason,
	MarketWithIdleMargin,
	SwapDepositToken,
	ModifyMarketMarginParams,
	ModifySmartMarginPositionParams,
	PerpsMarketV2,
	PositionDetail,
	SubmitIsolatedMarginOrdersParams,
	SubmitSmartMarginOrderParams,
	UpdateConditionalOrderParams,
	DepositSmartMarginParams,
} from '../types/futures'
import { PricesMap } from '../types/prices'
import { calculateTimestampForPeriod } from '../utils/date'
import {
	calculateFundingRate,
	calculateVolumes,
	ConditionalOrderResult,
	encodeCloseOffchainOrderParams,
	encodeConditionalOrderParams,
	encodeModidyMarketMarginParams,
	encodeSubmitOffchainOrderParams,
	formatPotentialTrade,
	formatV2DelayedOrder,
	getFuturesEndpoint,
	mapConditionalOrderFromContract,
	mapFuturesPosition,
	mapFuturesPositions,
	mapTrades,
	marginTypeToSubgraphType,
	formatPerpsV2Market,
	getQuote,
	getDecimalsForSwapDepositToken,
	MarketKeyByAsset,
	marketsForNetwork,
} from '../utils/futures'
import { getFuturesAggregateStats } from '../utils/subgraph'
import { getReasonFromCode } from '../utils/synths'
import { getPermit2Amount, getPermit2TypedData } from '../utils/permit2'
import { PERMIT2_ADDRESS, PERMIT_STRUCT } from '../constants/permit2'
import { FuturesAggregateStatResult } from '../utils/subgraph'

export default class FuturesService {
	private sdk: KwentaSDK
	private markets: PerpsMarketV2[] | undefined
	private internalFuturesMarkets: Partial<
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
		// const enabledMarkets = marketsForNetwork(
		// 	networkOverride?.networkId || this.sdk.context.networkId,
		// 	this.sdk.context.logError
		// )
		// const contracts =
		// 	networkOverride && networkOverride?.networkId !== this.sdk.context.networkId
		// 		? getContractsByNetwork(networkOverride.networkId, networkOverride.provider)
		// 		: this.sdk.context.contracts

		// const { SystemStatus } = contracts
		// const { ExchangeRates, PerpsV2MarketData, PerpsV2MarketSettings } =
		// 	this.sdk.context.multicallContracts

		// if (!SystemStatus || !ExchangeRates || !PerpsV2MarketData || !PerpsV2MarketSettings) {
		// 	throw new Error(UNSUPPORTED_NETWORK)
		// }

		// const futuresData = await this.sdk.context.multicallProvider.all([
		// 	PerpsV2MarketData.allProxiedMarketSummaries(),
		// 	PerpsV2MarketSettings.minInitialMargin(),
		// 	PerpsV2MarketSettings.minKeeperFee(),
		// ])

		// const { markets, minInitialMargin, minKeeperFee } = {
		// 	markets: futuresData[0] as PerpsV2MarketData.MarketSummaryStructOutput[],
		// 	minInitialMargin: futuresData[1] as BigNumber,
		// 	minKeeperFee: futuresData[2] as BigNumber,
		// }

		// const filteredMarkets = markets.filter((m) => {
		// 	const marketKey = parseBytes32String(m.key) as FuturesMarketKey
		// 	const market = enabledMarkets.find((market) => marketKey === market.key)
		// 	return !!market
		// })

		// const marketKeys = filteredMarkets.map((m) => m.key)

		// const parametersCalls = marketKeys.map((key) => PerpsV2MarketSettings.parameters(key))

		// let marketParameters: IPerpsV2MarketSettings.ParametersStructOutput[] = []

		// if (this.sdk.context.isMainnet) {
		// 	marketParameters = await this.sdk.context.multicallProvider.all(parametersCalls)
		// } else {
		// 	const firstResponses = await this.sdk.context.multicallProvider.all(
		// 		parametersCalls.slice(0, 20)
		// 	)
		// 	const secondResponses = await this.sdk.context.multicallProvider.all(
		// 		parametersCalls.slice(20, parametersCalls.length)
		// 	)
		// 	marketParameters = [
		// 		...firstResponses,
		// 		...secondResponses,
		// 	] as IPerpsV2MarketSettings.ParametersStructOutput[]
		// }

		// const { suspensions, reasons } = await SystemStatus.getFuturesMarketSuspensions(marketKeys)

		// const futuresMarkets = filteredMarkets.map((m, i) =>
		// 	formatPerpsV2Market(
		// 		m,
		// 		marketParameters[i],
		// 		{ minKeeperFee: wei(minKeeperFee), minInitialMargin: wei(minInitialMargin) },
		// 		suspensions[i],
		// 		getReasonFromCode(reasons[i]) as MarketClosureReason
		// 	)
		// )

		const { data: futuresMarkets } = await axios.get<PerpsMarketV2[]>(
			'http://localhost/futures/markets'
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
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const markets = await sdk.futures.getMarkets()
	 * const marketDetails = markets.map((m) => ({ address: m.market, marketKey: m.marketKey, asset: m.asset }))
	 * const positions = await sdk.futures.getFuturesPositions('0x...', marketDetails)
	 * console.log(positions)
	 * ```
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
	public async getAverageFundingRates(markets: PerpsMarketV2[], prices: PricesMap, period: Period) {
		const fundingRateInputs: FundingRateInput[] = markets.map(
			({ asset, marketAddress: market, currentFundingRate }) => {
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
		// const minTimestamp = Math.floor(calculateTimestampForPeriod(PERIOD_IN_HOURS.ONE_DAY) / 1000)
		// const response = await getFuturesAggregateStats(
		// 	this.futuresGqlEndpoint,
		// 	{
		// 		first: 999999,
		// 		where: {
		// 			period: `${PERIOD_IN_SECONDS.ONE_HOUR}`,
		// 			timestamp_gte: `${minTimestamp}`,
		// 		},
		// 	},
		// 	{
		// 		id: true,
		// 		marketKey: true,
		// 		asset: true,
		// 		volume: true,
		// 		trades: true,
		// 		timestamp: true,
		// 		period: true,
		// 		feesCrossMarginAccounts: true,
		// 		feesKwenta: true,
		// 		feesSynthetix: true,
		// 	}
		// )

		const { data: response } = await axios.get<FuturesAggregateStatResult[]>(
			'http://localhost/futures/daily-volumes'
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
	 * @desc Get market margin transfer history for a given wallet address
	 * @param walletAddress Wallet address
	 * @returns Array of past margin trensfers between perps markets for the given wallet address
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const transfers = await sdk.futures.getMarketMarginTransfers()
	 * console.log(transfers)
	 * ```
	 */
	public async getMarketMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return queryIsolatedMarginTransfers(this.sdk, address)
	}

	/**
	 * @desc Get smart margin transfer history for a given wallet address
	 * @param walletAddress Wallet address
	 * @returns Array of past smart margin account deposits and withdrawals for the given wallet address
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const transfers = await sdk.futures.getSmartMarginAccountTransfers()
	 * console.log(transfers)
	 * ```
	 */
	public async getSmartMarginAccountTransfers(
		walletAddress?: string | null
	): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return querySmartMarginAccountTransfers(this.sdk, address)
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
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const balanceInfo = await sdk.futures.getSmartMarginBalanceInfo('0x...', '0x...')
	 * console.log(balanceInfo)
	 * ```
	 */
	public async getSmartMarginBalanceInfo(walletAddress: string, smartMarginAddress: string) {
		const smartMarginAccountContract = new EthCallContract(
			smartMarginAddress,
			SmartMarginAccountABI
		)

		const { SUSD, USDC, USDT, DAI, LUSD } = this.sdk.context.multicallContracts

		// Cover testnet case
		if (!this.sdk.context.isMainnet) {
			if (!SUSD) throw new Error(UNSUPPORTED_NETWORK)

			const [freeMargin, keeperEthBal, walletEthBal, susdBalance, allowance] =
				await this.sdk.context.multicallProvider.all([
					smartMarginAccountContract.freeMargin(),
					this.sdk.context.multicallProvider.getEthBalance(smartMarginAddress),
					this.sdk.context.multicallProvider.getEthBalance(walletAddress),
					SUSD.balanceOf(walletAddress),
					SUSD.allowance(walletAddress, smartMarginAddress),
				])

			return {
				freeMargin: wei(freeMargin),
				keeperEthBal: wei(keeperEthBal),
				walletEthBal: wei(walletEthBal),
				allowance: wei(allowance),
				balances: {
					[SwapDepositToken.SUSD]: wei(susdBalance),
					[SwapDepositToken.USDC]: wei(0, 6),
					// [SwapDepositToken.USDT]: wei(usdtBalance, 6),
					[SwapDepositToken.DAI]: wei(0),
					// [SwapDepositToken.LUSD]: wei(lusdBalance),
				},
				allowances: {
					[SwapDepositToken.SUSD]: wei(allowance),
					[SwapDepositToken.USDC]: wei(0, 6),
					// [SwapDepositToken.USDT]: wei(usdtAllowance, 6),
					[SwapDepositToken.DAI]: wei(0),
					// [SwapDepositToken.LUSD]: wei(lusdAllowance),
				},
			}
		}

		if (!SUSD || !USDC || !USDT || !DAI || !LUSD) throw new Error(UNSUPPORTED_NETWORK)

		const [
			freeMargin,
			keeperEthBal,
			walletEthBal,
			susdBalance,
			allowance,
			usdcBalance,
			usdcAllowance,
			// usdtBalance,
			// usdtAllowance,
			daiBalance,
			daiAllowance,
			// lusdBalance,
			// lusdAllowance,
		] = await this.sdk.context.multicallProvider.all([
			smartMarginAccountContract.freeMargin(),
			this.sdk.context.multicallProvider.getEthBalance(smartMarginAddress),
			this.sdk.context.multicallProvider.getEthBalance(walletAddress),
			SUSD.balanceOf(walletAddress),
			SUSD.allowance(walletAddress, smartMarginAddress),
			USDC.balanceOf(walletAddress),
			USDC.allowance(walletAddress, PERMIT2_ADDRESS),
			// USDT.balanceOf(walletAddress),
			// USDT.allowance(walletAddress, PERMIT2_ADDRESS),
			DAI.balanceOf(walletAddress),
			DAI.allowance(walletAddress, PERMIT2_ADDRESS),
			// LUSD.balanceOf(walletAddress),
			// LUSD.allowance(walletAddress, PERMIT2_ADDRESS),
		])

		return {
			freeMargin: wei(freeMargin),
			keeperEthBal: wei(keeperEthBal),
			walletEthBal: wei(walletEthBal),
			allowance: wei(allowance),
			balances: {
				[SwapDepositToken.SUSD]: wei(susdBalance),
				[SwapDepositToken.USDC]: wei(usdcBalance, 6),
				// [SwapDepositToken.USDT]: wei(usdtBalance, 6),
				[SwapDepositToken.DAI]: wei(daiBalance),
				// [SwapDepositToken.LUSD]: wei(lusdBalance),
			},
			allowances: {
				[SwapDepositToken.SUSD]: wei(allowance),
				[SwapDepositToken.USDC]: wei(usdcAllowance, 6),
				// [SwapDepositToken.USDT]: wei(usdtAllowance, 6),
				[SwapDepositToken.DAI]: wei(daiAllowance),
				// [SwapDepositToken.LUSD]: wei(lusdAllowance),
			},
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
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const order = await sdk.futures.getDelayedOrder('0x...', '0x...')
	 * console.log(order)
	 * ```
	 */
	public async getDelayedOrder(account: string, marketAddress: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider)
		const order = await market.delayedOrders(account)
		return formatV2DelayedOrder(account, marketAddress, order)
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

		return orders.map((order, i) => formatV2DelayedOrder(account, marketAddresses[i], order))
	}

	/**
	 * @desc Generate a trade preview for a potential trade with an isolated margin account.
	 * @param marketAddress Futures market address
	 * @param marketKey Futures market key
	 * @param orderType Order type (market, delayed, delayed offchain)
	 * @param inputs Object containing size delta, order price, and leverage side
	 * @returns Object containing details about the potential trade
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const preview = await sdk.futures.getIsolatedMarginTradePreview(
	 *   '0x...',
	 *   '0x...',
	 *   FuturesMarketKey.sBTCPERP,
	 *   ContractOrderType.MARKET,
	 *   { sizeDelta: wei(1), price: wei(10000), leverageSide: PositionSide.SHORT }
	 * )
	 * console.log(preview)
	 * ```
	 */
	public async getIsolatedMarginTradePreview({
		market,
		orderType,
		sizeDelta,
		leverageSide,
		price,
	}: GetIsolatedMarginTradePreviewParams) {
		const marketContract = PerpsV2Market__factory.connect(
			market.marketAddress,
			this.sdk.context.provider
		)
		const details = await marketContract.postTradeDetails(
			sizeDelta.toBN(),
			price.toBN(),
			orderType,
			this.sdk.context.walletAddress
		)

		const skewAdjustedPrice = await this.getSkewAdjustedPrice({
			price,
			...market,
		})

		return formatPotentialTrade(details, skewAdjustedPrice, sizeDelta, leverageSide)
	}

	/**
	 * @desc Generate a trade preview for a potential trade with a smart margin account.
	 * @param account Smart margin account address
	 * @param marketKey Futures market key
	 * @param marketAddress Futures market address
	 * @param tradeParams Object containing size delta, margin delta, order price, and leverage side
	 * @returns Object containing details about the potential trade
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const preview = await sdk.futures.getSmartMarginTradePreview(
	 *  '0x...',
	 *  FuturesMarketKey.sBTCPERP,
	 *  '0x...',
	 * 	{
	 * 		sizeDelta: wei(1),
	 * 		marginDelta: wei(1),
	 * 		orderPrice: wei(10000),
	 * 		leverageSide: PositionSide.SHORT,
	 * 	}
	 * )
	 * console.log(preview)
	 * ```
	 */
	public async getSmartMarginTradePreview({
		account,
		market,
		tradeParams,
	}: GetSmartMarginTradePreviewParams) {
		const marketInternal = this.getInternalFuturesMarket(market)

		const preview = await marketInternal.getTradePreview(
			account,
			tradeParams.sizeDelta.toBN(),
			tradeParams.marginDelta.toBN(),
			tradeParams.orderPrice.toBN()
		)

		const skewAdjustedPrice = await this.getSkewAdjustedPrice({
			price: tradeParams.orderPrice,
			...market,
		})

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
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const positionHistory = await sdk.futures.getPositionHistory('0x...')
	 * console.log(positionHistory)
	 * ```
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
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const trades = await sdk.futures.getTradesForMarket(
	 *  FuturesMarketAsset.sBTC,
	 *  '0x...',
	 *  FuturesMarginType.SMART_MARGIN
	 * )
	 * console.log(trades)
	 * ```
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
		const filteredMarkets: PerpsMarketV2[] = []

		const marketParams: {
			asset: FuturesMarketAsset
			marketKey: FuturesMarketKey
			address: string
		}[] = []

		markets.forEach((m) => {
			if (!m.isSuspended) {
				filteredMarkets.push(m)
				marketParams.push({ asset: m.asset, marketKey: m.marketKey, address: m.marketAddress })
			}
		})

		const positions = await this.getFuturesPositions(accountOrEoa, marketParams)

		return positions
			.filter((p) => p.remainingMargin.abs().gt(0) && (!p.position || p.position?.size.eq(0)))
			.reduce(
				(acc, p) => {
					acc.totalIdleInMarkets = acc.totalIdleInMarkets.add(p.remainingMargin)

					const market = filteredMarkets.find((m) => m.marketKey === p.marketKey)

					if (market) {
						acc.marketsWithIdleMargin.push({
							...market,
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
	/**
	 * @desc Get futures trades for a given market
	 * @param marketKey Futures market key
	 * @param minTs Minimum timestamp
	 * @param maxTs Maximum timestamp
	 * @returns Array of trades for the given market
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const trades = await sdk.futures.getFuturesTrades(FuturesMarketKey.sBTCPERP, 0, 0)
	 * console.log(trades)
	 * ```
	 */
	public async getFuturesTrades(marketKey: FuturesMarketKey, minTs: number, maxTs: number) {
		const response = await queryFuturesTrades(this.sdk, marketKey, minTs, maxTs)
		return response ? mapTrades(response) : null
	}

	// TODO: Get delayed order fee
	/**
	 * @desc Get order fee, based on the specified market and given order size
	 * @param marketAddress Market address
	 * @param size Size of the order
	 * @returns Fee for the given order size, based on the specified market
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const fee = await sdk.futures.getOrderFee('0x...', wei(1))
	 * console.log(fee)
	 * ```
	 */
	public async getOrderFee(marketAddress: string, size: Wei) {
		const marketContract = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const orderFee = await marketContract.orderFee(size.toBN(), 0)
		return wei(orderFee.fee)
	}

	// Contract mutations

	/**
	 * @desc Approve a smart margin account deposit
	 * @param smartMarginAddress Smart margin account address
	 * @param token Swap deposit token
	 * @param amount Amount to approve
	 * @returns ethers.js TransactionResponse object
	 */
	public async approveSmartMarginDeposit<T extends boolean | undefined = false>({
		address,
		token = SwapDepositToken.SUSD,
		amount = BigNumber.from(ethers.constants.MaxUint256),
		isPrepareOnly,
	}: ApproveSmartMarginDepositParams<T>): TxReturn<T> {
		const tokenContract = this.sdk.context.contracts[token]

		if (!tokenContract) throw new Error(UNSUPPORTED_NETWORK)

		const txn = this.sdk.transactions.prepareContractTxn(tokenContract, 'approve', [
			token === SwapDepositToken.SUSD ? address : PERMIT2_ADDRESS,
			amount,
		])
		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Deposit sUSD into a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @param amount Amount to deposit
	 * @param token Swap deposit token
	 * @param slippage Slippage tolerance for the swap deposit
	 * @returns ethers.js TransactionResponse object
	 */
	public async depositSmartMarginAccount<T extends boolean | undefined = false>({
		address,
		amount,
		token = SwapDepositToken.SUSD,
		slippage = 0.15,
		isPrepareOnly,
	}: DepositSmartMarginParams<T>): TxReturn<T> {
		const tokenContract = this.sdk.context.contracts[token]
		const { SUSD } = this.sdk.context.contracts

		if (!tokenContract || !SUSD) throw new Error(UNSUPPORTED_NETWORK)

		const walletAddress = await this.sdk.context.signer.getAddress()

		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			address,
			this.sdk.context.signer
		)

		const commands: AccountExecuteFunctions[] = []
		const inputs: string[] = []

		let amountOutMin = amount

		if (token !== SwapDepositToken.SUSD) {
			const permitAmount = await getPermit2Amount(
				this.sdk.context.provider,
				walletAddress,
				tokenContract.address,
				address
			)

			if (amount.toBN().gt(permitAmount)) {
				const { command, input } = await this.signPermit(address, tokenContract.address)

				commands.push(command)
				inputs.push(input)
			}

			const quote = await getQuote(token, amount)

			// TODO: Consider passing slippage into getQuote function

			amountOutMin = quote.sub(quote.mul(slippage).div(100))

			if (!amountOutMin) {
				throw new Error('Deposit failed: Could not get quote for swap deposit')
			}

			const path = tokenContract.address + LOW_FEE_TIER_BYTES.slice(2) + SUSD.address.slice(2)

			commands.push(AccountExecuteFunctions.UNISWAP_V3_SWAP)
			inputs.push(
				defaultAbiCoder.encode(
					['uint256', 'uint256', 'bytes'],
					[wei(amount, getDecimalsForSwapDepositToken(token)).toBN(), amountOutMin.toBN(), path]
				)
			)
		} else {
			commands.push(AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN)
			inputs.push(defaultAbiCoder.encode(['int256'], [amountOutMin.toBN()]))
		}

		const txn = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Withdraw sUSD from a smart margin account
	 * @param smartMarginAddress Smart margin account address
	 * @param amount Amount to withdraw
	 * @returns ethers.js TransactionResponse object
	 */
	public async withdrawSmartMarginAccount<T extends boolean | undefined = false>({
		address,
		amount,
		isPrepareOnly,
	}: ChangeMarketBalanceParams<T>): TxReturn<T> {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			address,
			this.sdk.context.signer
		)
		const { commands, inputs } = await this.batchIdleMarketMarginSweeps(address)

		commands.push(AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN)
		inputs.push(defaultAbiCoder.encode(['int256'], [amount.neg().toBN()]))
		const txn = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	public async getSwapDepositQuote(token: SwapDepositToken, amount: Wei) {
		if (token === SwapDepositToken.SUSD) {
			return amount
		}

		const quote = await getQuote(token, amount)

		if (!quote) {
			throw new Error('Could not get Uniswap quote for swap deposit token balance')
		}

		return quote
	}

	/**
	 * @desc Modify the margin for a specific market in a smart margin account
	 * @param address Smart margin account address
	 * @param market Market address
	 * @param marginDelta Amount to modify the margin by (can be positive or negative)
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns ethers.js TransactionResponse object
	 */
	public async modifySmartMarginMarketMargin<T extends boolean | undefined = false>(
		params: ModifyMarketMarginParams<T>
	): TxReturn<T> {
		const { address, market, marginDelta, isPrepareOnly } = params
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			address,
			this.sdk.context.signer
		)

		const commands = []
		const inputs = []

		if (marginDelta.gt(0)) {
			const freeMargin = await this.getSmartMarginAccountBalance(address)
			if (marginDelta.gt(freeMargin)) {
				// Margin delta bigger than account balance,
				// need to pull some from the users wallet or idle margin
				const {
					commands: sweepCommands,
					inputs: sweepInputs,
					idleMargin,
				} = await this.batchIdleMarketMarginSweeps(address)

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
		inputs.push(encodeModidyMarketMarginParams(market, marginDelta))

		const tx = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])

		if (isPrepareOnly) {
			return tx as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(tx) as TxReturn<T>
		}
	}

	/**
	 * @desc Modify the position size for a specific market in a smart margin account
	 * @param address Smart margin account address
	 * @param market Object containing the market key and address
	 * @param sizeDelta Intended size change (positive or negative)
	 * @param desiredFillPrice Desired fill price
	 * @param cancelPendingReduceOrders Boolean describing if pending reduce orders should be cancelled
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.modifySmartMarginPositionSize(
	 *   '0x...',
	 *   { key: FuturesMarketKey.sBTCPERP, address: '0x...' },
	 *   wei(1),
	 *   wei(10000),
	 *   true
	 * )
	 * console.log(txn)
	 * ```
	 */
	public async modifySmartMarginPositionSize<T extends boolean | undefined = false>({
		address,
		market,
		sizeDelta,
		desiredFillPrice,
		cancelPendingReduceOrders,
		isPrepareOnly,
	}: ModifySmartMarginPositionParams<T>): TxReturn<T> {
		const commands = []
		const inputs = []

		if (cancelPendingReduceOrders) {
			const existingOrders = await this.getConditionalOrders(address)

			existingOrders.forEach((o) => {
				// Remove all pending reduce only orders if instructed
				if (o.marketKey === market.marketKey && o.reduceOnly) {
					commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
					inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
				}
			})
		}

		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			address,
			this.sdk.context.signer
		)

		commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER)
		inputs.push(encodeSubmitOffchainOrderParams(market.marketAddress, sizeDelta, desiredFillPrice))

		const tx = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])

		if (isPrepareOnly) {
			return tx as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(tx) as TxReturn<T>
		}
	}

	/**
	 * @desc Deposit margin for use in an isolated margin market
	 * @param address Market address
	 * @param amount Amount to deposit
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.depositIsolatedMargin('0x...', wei(1))
	 * console.log(txn)
	 * ```
	 */
	public async depositIsolatedMargin<T extends boolean | undefined = false>({
		address,
		amount,
		isPrepareOnly,
	}: ChangeMarketBalanceParams<T>): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(address, this.sdk.context.signer)
		const txn = this.sdk.transactions.prepareContractTxn(market, 'transferMargin', [amount.toBN()])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Withdraw margin from an isolated margin market
	 * @param address Market address
	 * @param amount Amount to withdraw
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.withdrawIsolatedMargin('0x...', wei(1))
	 * console.log(txn)
	 * ```
	 */
	public async withdrawIsolatedMargin<T extends boolean | undefined = false>({
		address,
		amount,
		isPrepareOnly,
	}: ChangeMarketBalanceParams<T>): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(address, this.sdk.context.signer)
		const txn = this.sdk.transactions.prepareContractTxn(market, 'transferMargin', [
			amount.neg().toBN(),
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Close an open position in an isolated margin market
	 * @param market Market address
	 * @param priceImpactDelta Price impact delta
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns ethers.js ContractTransaction object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.closeIsolatedPosition('0x...', wei(1))
	 * console.log(txn)
	 * ```
	 */
	public async closeIsolatedPosition<T extends boolean | undefined = false>({
		marketAddress,
		priceImpactDelta,
		isPrepareOnly,
	}: CloseIsolatedPositionParams<T>): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)

		const txn = this.sdk.transactions.prepareContractTxn(market, 'closePositionWithTracking', [
			priceImpactDelta.toBN(),
			KWENTA_TRACKING_CODE,
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Get idle margin for given wallet address or smart margin account address
	 * @param eoa Wallet address
	 * @param account Smart margin account address
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns Total idle margin, idle margin in markets, total wallet balance and the markets with idle margin for the given address(es).
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const idleMargin = await sdk.futures.getIdleMargin('0x...')
	 * console.log(idleMargin)
	 * ```
	 */
	public async submitIsolatedMarginOrder<T extends boolean | undefined = false>({
		marketAddress,
		sizeDelta,
		priceImpactDelta,
		isPrepareOnly,
	}: SubmitIsolatedMarginOrdersParams<T>): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)

		const txn = this.sdk.transactions.prepareContractTxn(
			market,
			'submitOffchainDelayedOrderWithTracking',
			[sizeDelta.toBN(), priceImpactDelta.toBN(), KWENTA_TRACKING_CODE]
		)

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Cancels a pending/expired delayed order, for the given market and account
	 * @param marketAddress Market address
	 * @param account Wallet address
	 * @param isOffchain Boolean describing if the order is offchain or not
	 * @param isPrepareOnly Boolean describing if the transaction should be prepared only without execute (default: false)
	 * @returns ethers.js ContractTransaction object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.cancelDelayedOrder('0x...', '0x...', true)
	 * console.log(txn)
	 * ```
	 */
	public async cancelDelayedOrder<T extends boolean | undefined = false>({
		marketAddress,
		account,
		isOffchain,
		isPrepareOnly,
	}: CancelDelayedOrderParams<T>): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)

		const txn = this.sdk.transactions.prepareContractTxn(
			market,
			isOffchain ? 'cancelOffchainDelayedOrder' : 'cancelDelayedOrder',
			[account]
		)

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Executes a pending delayed order, for the given market and account
	 * @param marketAddress Market address
	 * @param account Wallet address
	 * @returns ethers.js ContractTransaction object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.executeDelayedOrder('0x...', '0x...')
	 * console.log(txn)
	 * ```
	 */
	public async executeDelayedOrder<T extends boolean | undefined = false>({
		marketAddress,
		account,
		isPrepareOnly,
	}: ExecuteDelayedOrderParams<T>): TxReturn<T> {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)

		const txn = this.sdk.transactions.prepareContractTxn(market, 'executeDelayedOrder', [account])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Executes a pending delayed order, for the given market and account
	 * @param key Futures market key
	 * @param address Market address
	 * @param account Wallet address
	 * @returns ethers.js ContractTransaction object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.executeDelayedOffchainOrder(FuturesMarketKey.sETHPERP, '0x...', '0x...')
	 * console.log(txn)
	 * ```
	 */
	public async executeDelayedOffchainOrder<T extends boolean | undefined = false>({
		marketKey: key,
		marketAddress: address,
		account,
		isPrepareOnly,
	}: ExecuteDelayedOffchainOrderParams<T>): TxReturn<T> {
		const { Pyth } = this.sdk.context.contracts
		const market = PerpsV2Market__factory.connect(address, this.sdk.context.signer)
		if (!Pyth) throw new Error(UNSUPPORTED_NETWORK)

		// get price update data
		const priceUpdateData = await this.sdk.prices.getPythPriceUpdateData(key)
		const updateFee = await Pyth.getUpdateFee(priceUpdateData)

		const txn = this.sdk.transactions.prepareContractTxn(
			market,
			'executeOffchainDelayedOrder',
			[account, priceUpdateData],
			{ value: updateFee }
		)

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Creates a smart margin account
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.createSmartMarginAccount()
	 * console.log(txn)
	 * ```
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
	public async submitSmartMarginOrder<T extends boolean | undefined = false>({
		market,
		walletAddress,
		smAddress,
		order,
		options = {},
		isPrepareOnly,
	}: SubmitSmartMarginOrderParams<T>): TxReturn<T> {
		const { cancelExpiredDelayedOrders, cancelPendingReduceOrders } = options

		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smAddress,
			this.sdk.context.signer
		)
		const commands = []
		const inputs = []

		if (cancelExpiredDelayedOrders) {
			commands.push(AccountExecuteFunctions.PERPS_V2_CANCEL_OFFCHAIN_DELAYED_ORDER)
			inputs.push(defaultAbiCoder.encode(['address'], [market.marketAddress]))
		}

		const [idleMargin, freeMargin] = await Promise.all([
			this.getIdleMargin(walletAddress, smAddress),
			this.getSmartMarginAccountBalance(smAddress),
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

			let depositAmount = order.marginDelta.gt(totalFreeMargin)
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
				inputs.push(encodeModidyMarketMarginParams(market.marketAddress, order.marginDelta))
				commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER)
				inputs.push(
					encodeSubmitOffchainOrderParams(
						market.marketAddress,
						order.sizeDelta,
						order.desiredFillPrice
					)
				)
			} else {
				commands.push(AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER)
				const params = encodeConditionalOrderParams(
					market.marketKey,
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
					market.marketKey,
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
					market.marketKey,
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

		const existingOrders = await this.getConditionalOrders(smAddress)
		const existingOrdersForMarket = existingOrders.filter(
			(o) => o.marketKey === market.marketKey && o.reduceOnly
		)

		if (cancelPendingReduceOrders) {
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

		const txn = this.sdk.transactions.prepareContractTxn(
			smartMarginAccountContract,
			'execute',
			[commands, inputs],
			{ value: order.keeperEthDeposit?.toBN() ?? '0' }
		)

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Closes a smart margin position
	 * @param market Object containing market address and key
	 * @param address Smart margin account address
	 * @param desiredFillPrice Desired fill price
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.closeSmartMarginPosition(
	 *  { address: '0x...', key: FuturesMarketKey.sBTCPERP },
	 *  '0x...',
	 *  wei(10000)
	 * )
	 * console.log(txn)
	 * ```
	 */
	public async closeSmartMarginPosition<T extends boolean | undefined = false>({
		market,
		address,
		desiredFillPrice,
		isPrepareOnly,
	}: CloseSmartMarginPositionParams<T>): TxReturn<T> {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			address,
			this.sdk.context.signer
		)

		const commands = []
		const inputs = []

		const existingOrders = await this.getConditionalOrders(address)

		existingOrders.forEach((o) => {
			if (o.marketKey === market.marketKey && o.reduceOnly) {
				commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
				inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
			}
		})

		commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_CLOSE_OFFCHAIN_DELAYED_ORDER)
		inputs.push(encodeCloseOffchainOrderParams(market.marketAddress, desiredFillPrice))

		const txn = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Cancels a conditional order
	 * @param account Smart margin account address
	 * @param orderId Conditional order id
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.cancelConditionalOrder('0x...', 1)
	 * console.log(txn)
	 * ```
	 */
	public async cancelConditionalOrder<T extends boolean | undefined = false>({
		account,
		orderId,
		isPrepareOnly,
	}: CancelConditionalOrderParams<T>): TxReturn<T> {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			account,
			this.sdk.context.signer
		)

		const txn = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER],
			[defaultAbiCoder.encode(['uint256'], [orderId])],
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Withdraws given smarkt margin account's keeper balance
	 * @param account Smart margin account address
	 * @param amount Amount to withdraw
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.withdrawAccountKeeperBalance('0x...', wei(1))
	 * console.log(txn)
	 * ```
	 */
	public async withdrawAccountKeeperBalance<T extends boolean | undefined = false>({
		address,
		amount,
		isPrepareOnly,
	}: ChangeMarketBalanceParams<T>): TxReturn<T> {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			address,
			this.sdk.context.signer
		)

		const txn = this.sdk.transactions.prepareContractTxn(smartMarginAccountContract, 'execute', [
			[AccountExecuteFunctions.ACCOUNT_WITHDRAW_ETH],
			[defaultAbiCoder.encode(['uint256'], [amount.toBN()])],
		])

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Updates the stop loss and take profit values for a given smart margin account, based on the specified market.
	 * @param marketKey Market key
	 * @param account Smart margin account address
	 * @param params Object containing the stop loss and take profit values
	 * @returns ethers.js TransactionResponse object
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const txn = await sdk.futures.updateStopLossAndTakeProfit(
	 *   FuturesMarketKey.sBTCPERP,
	 *   '0x...',
	 *   {
	 *     stopLoss: {
	 * 	     price: wei(10000),
	 * 	     sizeDelta: wei(1),
	 * 	     desiredFillPrice: wei(10000),
	 * 	     isCancelled: false,
	 *     },
	 *     takeProfit: {
	 * 	     price: wei(10000),
	 * 	     sizeDelta: wei(1),
	 * 	     desiredFillPrice: wei(10000),
	 * 	     isCancelled: false,
	 *     },
	 *     keeperEthDeposit: wei(0.1),
	 *   }
	 * )
	 * console.log(txn)
	 * ```
	 */
	public async updateStopLossAndTakeProfit<T extends boolean | undefined = false>({
		marketKey,
		account,
		params,
		isPrepareOnly,
	}: UpdateConditionalOrderParams<T>): TxReturn<T> {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			account,
			this.sdk.context.signer
		)
		const commands = []
		const inputs = []

		if (params.takeProfit || params.stopLoss) {
			const existingOrders = await this.getConditionalOrders(account)
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

		const txn = this.sdk.transactions.prepareContractTxn(
			smartMarginAccountContract,
			'execute',
			[commands, inputs],
			{ value: params.keeperEthDeposit?.toBN() ?? '0' }
		)

		if (isPrepareOnly) {
			return txn as TxReturn<T>
		} else {
			return this.sdk.transactions.createEVMTxn(txn) as TxReturn<T>
		}
	}

	/**
	 * @desc Adjusts the given price, based on the current market skew.
	 * @param price Price to adjust
	 * @param address Market address
	 * @param key Market key
	 * @returns Adjusted price, based on the given market's skew.
	 * @example
	 * ```ts
	 * const sdk = new KwentaSDK()
	 * const adjustedPrice = await sdk.futures.getSkewAdjustedPrice(wei(10000), '0x...', FuturesMarketKey.sBTCPERP)
	 * console.log(adjustedPrice)
	 * ```
	 */
	public async getSkewAdjustedPrice({
		price,
		marketAddress: address,
		marketKey: key,
	}: GetSkewAdjustedPriceParams) {
		const marketContract = new EthCallContract(address, PerpsMarketABI)
		const { PerpsV2MarketSettings } = this.sdk.context.multicallContracts
		if (!PerpsV2MarketSettings) throw new Error(UNSUPPORTED_NETWORK)

		const [marketSkew, skewScale] = await this.sdk.context.multicallProvider.all([
			marketContract.marketSkew(),
			PerpsV2MarketSettings.skewScale(formatBytes32String(key)),
		])

		const skewWei = wei(marketSkew)
		const scaleWei = wei(skewScale)

		return price.mul(skewWei.div(scaleWei).add(1))
	}

	// Private methods

	private getInternalFuturesMarket({ marketKey: key, marketAddress: address }: Market) {
		let market = this.internalFuturesMarkets[this.sdk.context.networkId]?.[address]
		if (market) return market
		market = new PerpsV2MarketInternal(this.sdk, this.sdk.context.provider, key, address)
		this.internalFuturesMarkets = {
			[this.sdk.context.networkId]: {
				...this.internalFuturesMarkets[this.sdk.context.networkId],
				[address]: market,
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

	private async signPermit(smartMarginAddress: string, tokenAddress: string) {
		// If we don't have enough from idle market margin then we pull from the wallet
		const walletAddress = await this.sdk.context.signer.getAddress()

		// Skip amount, we will use the permit to approve the max amount
		const data = await getPermit2TypedData(
			this.sdk.context.provider,
			tokenAddress,
			walletAddress,
			smartMarginAddress
		)

		const signedMessage = await this.sdk.transactions.signTypedData(data)

		return {
			command: AccountExecuteFunctions.PERMIT2_PERMIT,
			input: defaultAbiCoder.encode([PERMIT_STRUCT, 'bytes'], [data.values, signedMessage]),
		}
	}
}
