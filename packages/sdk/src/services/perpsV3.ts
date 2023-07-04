import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String } from '@ethersproject/strings'
import Wei, { wei } from '@synthetixio/wei'
import { Contract as EthCallContract } from 'ethcall'
import { ethers } from 'ethers'

import KwentaSDK from '..'
import { UNSUPPORTED_NETWORK } from '../common/errors'
import { KWENTA_TRACKING_CODE } from '../constants/futures'
import { Period, PERIOD_IN_SECONDS } from '../constants/period'
import { getPerpsV2MarketMulticall } from '../contracts'
import PerpsMarketABI from '../contracts/abis/PerpsV2Market.json'
import PerpsV2MarketInternal from '../contracts/PerpsV2MarketInternalV2'
import { PerpsV2Market__factory } from '../contracts/types'
import { IPerpsV2MarketConsolidated } from '../contracts/types/PerpsV2Market'
import {
	queryFuturesTrades,
	queryIsolatedMarginTransfers,
	queryPositionHistory,
	queryTrades,
	queryFundingRateHistory,
} from '../queries/futures'
import { NetworkId, NetworkOverrideOptions } from '../types/common'
import {
	FuturesMarket,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesVolumes,
	MarketClosureReason,
	ContractOrderType,
	PositionDetail,
	PositionSide,
	MarginTransfer,
	FuturesAccountType,
} from '../types/futures'
import { PricesMap } from '../types/prices'
import {
	appAdjustedLeverage,
	formatDelayedOrder,
	mapFuturesPosition,
	mapFuturesPositions,
	mapTrades,
	getPerpsV3SubgraphUrl,
} from '../utils/futures'
import { getReasonFromCode } from '../utils/synths'
import { getPerpsV3Markets, queryPerpsV3Accounts } from '../queries/perpsV3'
import { weiFromWei } from '../utils'

export default class PerpsV3Service {
	private sdk: KwentaSDK
	public markets: FuturesMarket[] | undefined
	public internalFuturesMarkets: Partial<
		Record<NetworkId, { [marketAddress: string]: PerpsV2MarketInternal }>
	> = {}

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	get subgraphUrl() {
		return getPerpsV3SubgraphUrl(this.sdk.context.networkId)
	}

	public async getMarkets(networkOverride?: NetworkOverrideOptions) {
		const perpsV3Markets = await getPerpsV3Markets(this.sdk)
		// const enabledMarkets = marketsForNetwork(
		// 	networkOverride?.networkId || this.sdk.context.networkId,
		// 	this.sdk.context.logError
		// )
		// const contracts =
		// 	networkOverride && networkOverride?.networkId !== this.sdk.context.networkId
		// 		? getContractsByNetwork(networkOverride.networkId, networkOverride.provider)
		// 		: this.sdk.context.contracts

		// const { SystemStatus } = contracts
		// const {
		// 	ExchangeRates,
		// 	PerpsV2MarketData,
		// 	PerpsV2MarketSettings,
		// } = this.sdk.context.multicallContracts

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
		// 	const market = enabledMarkets.find((market) => {
		// 		return marketKey === market.key
		// 	})
		// 	return !!market
		// })

		// const marketKeys = filteredMarkets.map((m) => {
		// 	return m.key
		// })

		// const parametersCalls = marketKeys.map((key: string) => PerpsV2MarketSettings.parameters(key))

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

		const futuresMarkets = perpsV3Markets.map(
			(
				{
					perpsMarketId,
					marketSymbol,
					marketName,
					marketOwner,
					maxFundingVelocity,
					makerFee,
					takerFee,
					skewScale,
				},
				i: number
			): FuturesMarket => ({
				market: marketOwner,
				marketKey: marketSymbol as FuturesMarketKey,
				marketName: marketName, // TODO: Map asset
				asset: marketSymbol as FuturesMarketAsset, // TODO: Map asset
				assetHex: '', // TODO: Probably remove hex
				currentFundingRate: wei(0.0001), // TODO: Funding rate
				currentFundingVelocity: wei(maxFundingVelocity).div(24 * 24), // TODO: Current not max?
				feeRates: {
					makerFee: weiFromWei(makerFee),
					takerFee: weiFromWei(takerFee),
					makerFeeDelayedOrder: weiFromWei(makerFee),
					takerFeeDelayedOrder: weiFromWei(takerFee),
					makerFeeOffchainDelayedOrder: weiFromWei(makerFee),
					takerFeeOffchainDelayedOrder: weiFromWei(takerFee),
				},
				openInterest: {
					// TODO: Assign open interest
					shortPct: 0,
					longPct: 0,
					shortUSD: wei(0),
					longUSD: wei(0),
					long: wei(0),
					short: wei(0),
				},
				marketDebt: wei(0),
				marketSkew: wei(0),
				contractMaxLeverage: wei(25), // TODO: Assign leverage
				appMaxLeverage: appAdjustedLeverage(wei(25)),
				marketSize: wei(0),
				marketLimitUsd: wei(1000000), // TODO: Assign limits
				marketLimitNative: wei(100),
				minInitialMargin: wei(50), // TODO: Is this still relevant in v3
				keeperDeposit: wei(4), // TODO: Assign min keeper fee
				isSuspended: false, // TODO: Assign suspensions
				marketClosureReason: getReasonFromCode(2) as MarketClosureReason, // TODO: Map closure reason
				settings: {
					maxMarketValue: wei(1000), // TODO: Max market value
					skewScale: weiFromWei(skewScale),
					delayedOrderConfirmWindow: 20000, // TODO: assign
					offchainDelayedOrderMinAge: 20000, // TODO: assign
					offchainDelayedOrderMaxAge: 20000, // TODO: assign
					minDelayTimeDelta: 100, // TODO: assign
					maxDelayTimeDelta: 100, // TODO: assign
				},
			})
		)
		return futuresMarkets
	}

	// TODO: types
	// TODO: Improve the API for fetching positions
	public async getFuturesPositions(
		address: string, // Cross margin or EOA address
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
		const positions = await Promise.all(
			positionDetails.map(async (position, ind) => {
				const canLiquidate = canLiquidateState[ind]
				const marketKey = futuresMarkets[ind].marketKey
				const asset = futuresMarkets[ind].asset

				return mapFuturesPosition(position, canLiquidate, asset, marketKey)
			})
		)

		return positions
	}

	public async getMarketFundingRatesHistory(
		marketAsset: FuturesMarketAsset,
		periodLength = PERIOD_IN_SECONDS.TWO_WEEKS
	) {
		const minTimestamp = Math.floor(Date.now() / 1000) - periodLength
		return queryFundingRateHistory(this.sdk, marketAsset, minTimestamp)
	}

	public async getAverageFundingRates(markets: FuturesMarket[], prices: PricesMap, period: Period) {
		return []
		// const fundingRateInputs: FundingRateInput[] = markets.map(
		// 	({ asset, market, currentFundingRate }) => {
		// 		const price = prices[asset]
		// 		return {
		// 			marketAddress: market,
		// 			marketKey: MarketKeyByAsset[asset],
		// 			price: price,
		// 			currentFundingRate: currentFundingRate,
		// 		}
		// 	}
		// )

		// const fundingRateQueries = fundingRateInputs.map(({ marketAddress, marketKey }) => {
		// 	return gql`
		// 			# last before timestamp
		// 			${marketKey}_first: fundingRateUpdates(
		// 				first: 1
		// 				where: { market: "${marketAddress}", timestamp_lt: $minTimestamp }
		// 				orderBy: sequenceLength
		// 				orderDirection: desc
		// 			) {
		// 				timestamp
		// 				funding
		// 			}

		// 			# first after timestamp
		// 			${marketKey}_next: fundingRateUpdates(
		// 				first: 1
		// 				where: { market: "${marketAddress}", timestamp_gt: $minTimestamp }
		// 				orderBy: sequenceLength
		// 				orderDirection: asc
		// 			) {
		// 				timestamp
		// 				funding
		// 			}

		// 			# latest update
		// 			${marketKey}_latest: fundingRateUpdates(
		// 				first: 1
		// 				where: { market: "${marketAddress}" }
		// 				orderBy: sequenceLength
		// 				orderDirection: desc
		// 			) {
		// 				timestamp
		// 				funding
		// 			}
		// 		`
		// })
		// const periodLength = PERIOD_IN_SECONDS[period]
		// const minTimestamp = Math.floor(Date.now() / 1000) - periodLength

		// const marketFundingResponses: Record<string, FundingRateUpdate[]> = await request(
		// 	this.futuresGqlEndpoint,
		// 	gql`
		// 	query fundingRateUpdates($minTimestamp: BigInt!) {
		// 		${fundingRateQueries.reduce((acc: string, curr: string) => {
		// 			return acc + curr
		// 		})}
		// 	}
		// `,
		// 	{ minTimestamp: minTimestamp }
		// )

		// const periodTitle = period === Period.ONE_HOUR ? '1H Funding Rate' : 'Funding Rate'

		// const fundingRateResponses = fundingRateInputs.map(
		// 	({ marketKey, currentFundingRate, price }) => {
		// 		if (!price) return null
		// 		const marketResponses = [
		// 			marketFundingResponses[`${marketKey}_first`],
		// 			marketFundingResponses[`${marketKey}_next`],
		// 			marketFundingResponses[`${marketKey}_latest`],
		// 		]

		// 		const responseFilt = marketResponses
		// 			.filter((value: FundingRateUpdate[]) => value.length > 0)
		// 			.map((entry: FundingRateUpdate[]): FundingRateUpdate => entry[0])
		// 			.sort((a: FundingRateUpdate, b: FundingRateUpdate) => a.timestamp - b.timestamp)

		// 		const fundingRate =
		// 			responseFilt && !!currentFundingRate
		// 				? calculateFundingRate(
		// 						minTimestamp,
		// 						periodLength,
		// 						responseFilt,
		// 						price,
		// 						currentFundingRate
		// 				  )
		// 				: currentFundingRate ?? null

		// 		const fundingPeriod =
		// 			responseFilt && !!currentFundingRate ? periodTitle : 'Inst. Funding Rate'

		// 		const fundingRateResponse: FundingRateResponse = {
		// 			asset: marketKey,
		// 			fundingTitle: fundingPeriod,
		// 			fundingRate: fundingRate,
		// 		}
		// 		return fundingRateResponse
		// 	}
		// )

		// return fundingRateResponses.filter((funding): funding is FundingRateResponse => !!funding)
	}

	public async getDailyVolumes(): Promise<FuturesVolumes> {
		return {}
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
		// return response ? calculateVolumes(response) : {}
	}

	public async getPerpsV3AccountIds(walletAddress?: string | null): Promise<string[]> {
		if (!walletAddress) return []
		const accounts = await queryPerpsV3Accounts(this.sdk, walletAddress.toLowerCase())
		return accounts.map((a) => a.id)
	}

	public async getAccountOwner(id: number): Promise<string> {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		if (!marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		return marketProxy.getAccountOwner(id)
	}

	public async getMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return queryIsolatedMarginTransfers(this.sdk, address)
	}

	public async getAccountCollateral(crossMarginAddress: string) {
		// TODO: Get collateral balances
		return {}
	}

	public async getAvailableMargin(walletAddress: string, crossMarginAddress: string) {
		return wei(0)
	}

	// Perps V2 read functions
	public async getDelayedOrder(account: string, marketAddress: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider)
		const order = await market.delayedOrders(account)
		return formatDelayedOrder(account, marketAddress, order)
	}

	public async getDelayedOrders(account: string, marketAddresses: string[]) {
		const marketContracts = marketAddresses.map(getPerpsV2MarketMulticall)

		const orders = (await this.sdk.context.multicallProvider.all(
			marketContracts.map((market) => market.delayedOrders(account))
		)) as IPerpsV2MarketConsolidated.DelayedOrderStructOutput[]
		return orders.map((order, ind) => {
			return formatDelayedOrder(account, marketAddresses[ind], order)
		})
	}

	public async getIsolatedTradePreview(
		marketAddress: string,
		marketKey: FuturesMarketKey,
		orderType: ContractOrderType,
		inputs: {
			sizeDelta: Wei
			price: Wei
			leverageSide: PositionSide
		}
	) {
		const fillPrice = wei(0)
		const liqPrice = wei(0)
		const leverage = wei(0)

		return {
			fillPrice,
			liqPrice,
			leverage,
		}
	}

	public async getPositionHistory(walletAddress: string) {
		const response = await queryPositionHistory(this.sdk, walletAddress)
		return response ? mapFuturesPositions(response) : []
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
		})
		return response ? mapTrades(response) : []
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
		})
		return response ? mapTrades(response) : []
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

	public async approveDeposit(
		crossMarginAddress: string,
		amount: BigNumber = BigNumber.from(ethers.constants.MaxUint256)
	) {
		if (!this.sdk.context.contracts.SUSD) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.SUSD, 'approve', [
			crossMarginAddress,
			amount,
		])
	}

	public async depositToAccount(marketAddress: string, amount: Wei) {
		// TODO: Accept account
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [amount.toBN()])
		return txn
	}

	public async withdrawFromAccount(marketAddress: string, amount: Wei) {
		// TODO: Accept account
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [
			amount.neg().toBN(),
		])
		return txn
	}

	public async closePosition(marketAddress: string, priceImpactDelta: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		return market.closePositionWithTracking(priceImpactDelta.toBN(), KWENTA_TRACKING_CODE)
	}

	public async submitOrder(
		marketId: string,
		accountId: string,
		sizeDelta: Wei,
		acceptablePrice: Wei
	) {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		if (!marketProxy) throw new Error(UNSUPPORTED_NETWORK)

		const commitment = {
			marketId: marketId,
			accountId,
			sizeDelta: sizeDelta.toBN,
			settlementStrategyId: 0,
			acceptablePrice: acceptablePrice.toBN(),
			trackingCode: ethers.constants.HashZero,
		}

		return this.sdk.transactions.createContractTxn(marketProxy, 'commitOrder', [commitment])
	}

	public async cancelDelayedOrder(marketAddress: string, account: string, isOffchain: boolean) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		return isOffchain
			? market.cancelOffchainDelayedOrder(account)
			: market.cancelDelayedOrder(account)
	}

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

	public async createPerpsV3Account(requestedId: number) {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		if (!marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(marketProxy, 'createAccount', [requestedId])
	}

	public getSkewAdjustedPrice = async (price: Wei, marketAddress: string, marketKey: string) => {
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
}
