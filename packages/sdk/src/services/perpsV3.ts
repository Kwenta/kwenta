import { BigNumber, BigNumberish } from '@ethersproject/bignumber'
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
import { NetworkId } from '../types/common'
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
	FuturesMarginType,
} from '../types/futures'
import { PricesMap } from '../types/prices'
import {
	appAdjustedLeverage,
	formatDelayedOrder,
	mapFuturesPosition,
	mapFuturesPositions,
	mapTrades,
	getPerpsV3SubgraphUrl,
	marginTypeToSubgraphType,
	PerpsV3SymbolToMarketKey,
	MarketAssetByKey,
	mapPerpsV3Position,
} from '../utils/futures'
import { getReasonFromCode } from '../utils/synths'
import { getPerpsV3Markets, queryPerpsV3Accounts } from '../queries/perpsV3'
import { weiFromWei } from '../utils'
import { ZERO_ADDRESS } from '../constants'
import { SynthV3Asset } from '../types'
import { V3_SYNTH_MARKET_IDS } from '../constants/perpsv3'

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

	public async getMarkets() {
		const perpsV3Markets = await getPerpsV3Markets(this.sdk)

		const futuresMarkets = perpsV3Markets.reduce<FuturesMarket[]>(
			(
				acc,
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
			) => {
				const marketKey = PerpsV3SymbolToMarketKey[marketSymbol]
				if (!marketKey) return acc

				acc.push({
					market: perpsMarketId,
					marketKey: marketKey,
					marketName: marketName,
					asset: MarketAssetByKey[marketKey],
					assetHex: '', // TODO: Probably remove hex
					currentFundingRate: wei(0.0001), // TODO: Funding rate
					currentFundingVelocity: wei(maxFundingVelocity).div(24 * 24), // TODO: Current not max?
					feeRates: {
						makerFee: weiFromWei(makerFee || 0),
						takerFee: weiFromWei(takerFee || 0),
						makerFeeDelayedOrder: weiFromWei(makerFee || 0),
						takerFeeDelayedOrder: weiFromWei(takerFee || 0),
						makerFeeOffchainDelayedOrder: weiFromWei(makerFee || 0),
						takerFeeOffchainDelayedOrder: weiFromWei(takerFee || 0),
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
				return acc
			},
			[]
		)
		return futuresMarkets
	}

	// TODO: types
	// TODO: Improve the API for fetching positions
	public async getPositions(
		address: string, // Cross margin or EOA address
		marketIds: number[]
	) {
		const proxy = this.sdk.context.multicallContracts.perpsV3MarketProxy

		if (!this.sdk.context.isL2 || !proxy) {
			throw new Error(UNSUPPORTED_NETWORK)
		}

		const positionCalls = marketIds.map((id) => proxy.getOpenPosition(address, id))

		// TODO: Combine these two?
		const positionDetails = (await this.sdk.context.multicallProvider.all(positionCalls)) as [
			BigNumber,
			BigNumber,
			BigNumber
		][]

		// map the positions using the results
		const positions = await Promise.all(
			positionDetails.map(async (res, i) => {
				return mapPerpsV3Position(marketIds[i], ...res)
			})
		)

		return positions.filter((position) => !!position)
	}

	public async getMarketFundingRatesHistory(
		marketAsset: FuturesMarketAsset,
		periodLength = PERIOD_IN_SECONDS.TWO_WEEKS
	) {
		const minTimestamp = Math.floor(Date.now() / 1000) - periodLength
		return queryFundingRateHistory(this.sdk, marketAsset, minTimestamp)
	}

	public async getAverageFundingRates(
		_markets: FuturesMarket[],
		_prices: PricesMap,
		_period: Period
	) {
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

	public async getAccountOwner(id: BigNumberish): Promise<string | null> {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		if (!marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		const owner = await marketProxy.getAccountOwner(id)
		if (owner === ZERO_ADDRESS) return null
		return owner
	}

	public async getMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return queryIsolatedMarginTransfers(this.sdk, address)
	}

	public async getAvailableMargin(accountId: string) {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		if (!marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		const availableMargin = await marketProxy.getAvailableMargin(accountId)
		return wei(availableMargin)
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
		_marketAddress: string,
		_marketKey: FuturesMarketKey,
		_orderType: ContractOrderType,
		_inputs: {
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
		const response = await queryPositionHistory(this.sdk, walletAddress, 'eoa')
		return response ? mapFuturesPositions(response) : []
	}

	// TODO: Support pagination

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

	public async getDepositAllowances(walletAddress: string) {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		const susdContract = this.sdk.context.contracts.SNXUSD
		if (!susdContract || !marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		const snxusd = await susdContract.allowance(walletAddress, marketProxy.address)
		return { snxusd: wei(snxusd) }
	}

	// Contract mutations

	public async approveDeposit(
		asset: SynthV3Asset,
		amount: BigNumber = BigNumber.from(ethers.constants.MaxUint256)
	) {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		const assetContract = this.sdk.context.contracts[asset]
		if (!assetContract || !marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(assetContract, 'approve', [
			marketProxy.address,
			amount,
		])
	}

	public async depositToMarket(accountId: string, asset: SynthV3Asset, amount: Wei) {
		const marketProxy = this.sdk.context.contracts.perpsV3MarketProxy
		if (!marketProxy) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(marketProxy, 'modifyCollateral', [
			accountId,
			V3_SYNTH_MARKET_IDS[asset],
			amount.toBN(),
		])
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

	public async createPerpsV3Account(requestedId: BigNumberish) {
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
