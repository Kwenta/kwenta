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
import {
	AMOUNT_OUT_MIN,
	KWENTA_TRACKING_CODE,
	LOW_FEE_TIER,
	ORDERS_FETCH_SIZE,
	SL_TP_MAX_SIZE,
} from '../constants/futures'
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
	PerpsMarketV2,
	SwapDepositToken,
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
	formatV2DelayedOrder,
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
import { getPermit2Amount, getPermit2TypedData } from '../utils/permit2'
import { PERMIT2_ADDRESS, PERMIT_STRUCT } from '../constants/permit2'

export default class FuturesService {
	private sdk: KwentaSDK
	public markets: PerpsMarketV2[] | undefined
	public internalFuturesMarkets: Partial<
		Record<NetworkId, { [marketAddress: string]: PerpsV2MarketInternal }>
	> = {}

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	get futuresGqlEndpoint() {
		return getFuturesEndpoint(this.sdk.context.networkId)
	}

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
			const market = enabledMarkets.find((market) => {
				return marketKey === market.key
			})
			return !!market
		})

		const marketKeys = filteredMarkets.map((m) => {
			return m.key
		})

		const parametersCalls = marketKeys.map((key: string) => PerpsV2MarketSettings.parameters(key))

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

		const futuresMarkets = filteredMarkets.map(
			(m, i: number): PerpsMarketV2 =>
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

	public async getAverageFundingRates(markets: PerpsMarketV2[], prices: PricesMap, period: Period) {
		const fundingRateInputs: FundingRateInput[] = markets.map(
			({ asset, marketAddress: market, currentFundingRate }) => {
				const price = prices[asset]
				return {
					marketAddress: market,
					marketKey: MarketKeyByAsset[asset],
					price: price,
					currentFundingRate: currentFundingRate,
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
				${fundingRateQueries.reduce((acc: string, curr: string) => {
					return acc + curr
				})}
			}
		`,
			{ minTimestamp: minTimestamp }
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
					.filter((value: FundingRateUpdate[]) => value.length > 0)
					.map((entry: FundingRateUpdate[]): FundingRateUpdate => entry[0])
					.sort((a: FundingRateUpdate, b: FundingRateUpdate) => a.timestamp - b.timestamp)

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
					fundingRate: fundingRate,
				}
				return fundingRateResponse
			}
		)

		return fundingRateResponses.filter((funding): funding is FundingRateResponse => !!funding)
	}

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

	public async getSmartMarginAccounts(walletAddress?: string | null): Promise<string[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return await querySmartMarginAccounts(this.sdk, address)
	}

	public async getIsolatedMarginTransfers(
		walletAddress?: string | null
	): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return queryIsolatedMarginTransfers(this.sdk, address)
	}

	public async getSmartMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]> {
		const address = walletAddress ?? this.sdk.context.walletAddress
		return querySmartMarginTransfers(this.sdk, address)
	}

	public async getSmartMarginAccountBalance(smartMarginAddress: string) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.provider
		)

		const freeMargin = await smartMarginAccountContract.freeMargin()
		return wei(freeMargin)
	}

	public async getSmartMarginBalanceInfo(walletAddress: string, smartMarginAddress: string) {
		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.provider
		)
		const { SUSD, USDC, USDT, DAI } = this.sdk.context.contracts

		if (!SUSD || !USDC || !USDT || !DAI) throw new Error(UNSUPPORTED_NETWORK)

		// TODO: EthCall
		const [
			freeMargin,
			keeperEthBal,
			walletEthBal,
			allowance,
			usdcAllowance,
			usdtAllowance,
			daiAllowance,
		] = await Promise.all([
			smartMarginAccountContract.freeMargin(),
			this.sdk.context.provider.getBalance(smartMarginAddress),
			this.sdk.context.provider.getBalance(walletAddress),
			SUSD.allowance(walletAddress, smartMarginAccountContract.address),
			USDC.allowance(walletAddress, PERMIT2_ADDRESS),
			USDT.allowance(walletAddress, PERMIT2_ADDRESS),
			DAI.allowance(walletAddress, PERMIT2_ADDRESS),
		])

		return {
			freeMargin: wei(freeMargin),
			keeperEthBal: wei(keeperEthBal),
			walletEthBal: wei(walletEthBal),
			allowance: wei(allowance),
			usdcAllowance: wei(usdcAllowance),
			usdtAllowance: wei(usdtAllowance),
			daiAllowance: wei(daiAllowance),
		}
	}

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
	public async getDelayedOrder(account: string, marketAddress: string) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider)
		const order = await market.delayedOrders(account)
		return formatV2DelayedOrder(account, marketAddress, order)
	}

	public async getDelayedOrders(account: string, marketAddresses: string[]) {
		const marketContracts = marketAddresses.map(getPerpsV2MarketMulticall)

		const orders = (await this.sdk.context.multicallProvider.all(
			marketContracts.map((market) => market.delayedOrders(account))
		)) as IPerpsV2MarketConsolidated.DelayedOrderStructOutput[]
		return orders.map((order, ind) => {
			return formatV2DelayedOrder(account, marketAddresses[ind], order)
		})
	}

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

	public async getSmartMarginKeeperBalance(account: string) {
		const bal = await this.sdk.context.provider.getBalance(account)
		return wei(bal)
	}

	public async getPositionHistory(address: string, addressType: 'eoa' | 'account' = 'account') {
		const response = await queryPositionHistory(this.sdk, address, addressType)
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

	public async getIdleMarginInMarkets(accountOrEoa: string) {
		const markets = this.markets ?? (await this.getMarkets())
		const filteredMarkets = markets.filter((m) => !m.isSuspended)
		const marketParams =
			filteredMarkets?.map((m) => ({
				asset: m.asset,
				marketKey: m.marketKey,
				address: m.marketAddress,
			})) ?? []
		const positions = await this.getFuturesPositions(accountOrEoa, marketParams)
		const positionsWithIdleMargin = positions.filter(
			(p) => !p.position?.size.abs().gt(0) && p.remainingMargin.gt(0)
		)
		const idleInMarkets = positionsWithIdleMargin.reduce(
			(acc, p) => acc.add(p.remainingMargin),
			wei(0)
		)
		return {
			totalIdleInMarkets: idleInMarkets,
			marketsWithIdleMargin: positionsWithIdleMargin.reduce<MarketWithIdleMargin[]>((acc, p) => {
				const market = filteredMarkets.find((m) => m.marketKey === p.marketKey)

				if (market) {
					acc.push({
						marketAddress: market.marketAddress,
						marketKey: market.marketKey,
						position: p,
					})
				}
				return acc
			}, []),
		}
	}

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

	public async approveSmartMarginDeposit(
		smartMarginAddress: string,
		amount: BigNumber = BigNumber.from(ethers.constants.MaxUint256),
		token: SwapDepositToken = SwapDepositToken.SUSD
	) {
		const tokenContract = this.sdk.context.contracts[token]

		if (!tokenContract) throw new Error(UNSUPPORTED_NETWORK)

		return this.sdk.transactions.createContractTxn(tokenContract, 'approve', [
			token === SwapDepositToken.SUSD ? smartMarginAddress : PERMIT2_ADDRESS,
			amount,
		])
	}

	public async depositSmartMarginAccount(
		smartMarginAddress: string,
		amount: Wei,
		token: SwapDepositToken = SwapDepositToken.SUSD
	) {
		const tokenContract = this.sdk.context.contracts[token]
		const { SUSD } = this.sdk.context.contracts

		if (!tokenContract || !SUSD) throw new Error(UNSUPPORTED_NETWORK)

		const walletAddress = await this.sdk.context.signer.getAddress()

		const smartMarginAccountContract = SmartMarginAccount__factory.connect(
			smartMarginAddress,
			this.sdk.context.signer
		)

		if (token === SwapDepositToken.SUSD) {
			return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
				[AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN],
				[defaultAbiCoder.encode(['int256'], [amount.toBN()])],
			])
		} else {
			const permitAmount = await getPermit2Amount(
				this.sdk.context.provider,
				walletAddress,
				tokenContract.address,
				smartMarginAddress
			)

			if (amount.toBN().lte(permitAmount)) {
				const { command, input } = await this.signPermit(smartMarginAddress, tokenContract.address)

				const path =
					defaultAbiCoder.encode(['bytes20'], [SUSD.address]) +
					defaultAbiCoder.encode(['bytes3'], [LOW_FEE_TIER]) +
					defaultAbiCoder.encode(['bytes20'], [tokenContract.address])

				return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
					[...command, AccountExecuteFunctions.UNISWAP_V3_SWAP],
					[
						...input,
						defaultAbiCoder.encode(
							['uint256', 'uint256', 'bytes'],
							[amount.toBN(), ethers.BigNumber.from(AMOUNT_OUT_MIN), path]
						),
					],
				])
			} else {
				throw new Error('Deposit failed: Deposit amount is greater than permitted amount')
			}
		}
	}

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

	public async modifySmartMarginPositionSize(
		smartMarginAddress: string,
		market: {
			key: FuturesMarketKey
			address: string
		},
		sizeDelta: Wei,
		desiredFillPrice: Wei,
		cancelPendingReduceOrders?: boolean
	) {
		const commands = []
		const inputs = []

		if (cancelPendingReduceOrders) {
			const existingOrders = await this.getConditionalOrders(smartMarginAddress)
			const existingOrdersForMarket = existingOrders.filter(
				(o) => o.marketKey === market.key && o.reduceOnly
			)
			// Remove all pending reduce only orders if instructed
			existingOrdersForMarket.forEach((o) => {
				commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
				inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
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

	public async depositIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [amount.toBN()])
		return txn
	}

	public async withdrawIsolatedMargin(marketAddress: string, amount: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [
			amount.neg().toBN(),
		])
		return txn
	}

	public async closeIsolatedPosition(marketAddress: string, priceImpactDelta: Wei) {
		const market = PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer)
		return market.closePositionWithTracking(priceImpactDelta.toBN(), KWENTA_TRACKING_CODE)
	}

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

	public async createSmartMarginAccount() {
		if (!this.sdk.context.contracts.SmartMarginAccountFactory) throw new Error(UNSUPPORTED_NETWORK)
		return this.sdk.transactions.createContractTxn(
			this.sdk.context.contracts.SmartMarginAccountFactory,
			'newAccount',
			[]
		)
	}

	public async submitSmartMarginOrder(
		market: {
			key: FuturesMarketKey
			address: string
		},
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

		const idleMargin = await this.getIdleMargin(walletAddress, smartMarginAddress)
		const freeMargin = await this.getSmartMarginAccountBalance(smartMarginAddress)

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

		const existingOrders = await this.getConditionalOrders(smartMarginAddress)
		const existingOrdersForMarket = existingOrders.filter(
			(o) => o.marketKey === market.key && o.reduceOnly
		)

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
			{
				value: order.keeperEthDeposit?.toBN() ?? '0',
			}
		)
	}

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
		const existingOrdersForMarket = existingOrders.filter(
			(o) => o.marketKey === market.key && o.reduceOnly
		)

		existingOrdersForMarket.forEach((o) => {
			commands.push(AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER)
			inputs.push(defaultAbiCoder.encode(['uint256'], [o.id]))
		})

		commands.push(AccountExecuteFunctions.PERPS_V2_SUBMIT_CLOSE_OFFCHAIN_DELAYED_ORDER)
		inputs.push(encodeCloseOffchainOrderParams(market.address, desiredFillPrice))

		return this.sdk.transactions.createContractTxn(smartMarginAccountContract, 'execute', [
			commands,
			inputs,
		])
	}

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
			const existingOrdersForMarket = existingOrders.filter((o) => o.marketKey === marketKey)
			const existingStopLosses = existingOrdersForMarket.filter(
				(o) =>
					o.size.abs().eq(SL_TP_MAX_SIZE) &&
					o.reduceOnly &&
					o.orderType === ConditionalOrderTypeEnum.STOP
			)
			const existingTakeProfits = existingOrdersForMarket.filter(
				(o) =>
					o.size.abs().eq(SL_TP_MAX_SIZE) &&
					o.reduceOnly &&
					o.orderType === ConditionalOrderTypeEnum.LIMIT
			)

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
			{
				value: params.keeperEthDeposit?.toBN() ?? '0',
			}
		)
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
			command: [AccountExecuteFunctions.PERMIT2_PERMIT],
			input: [defaultAbiCoder.encode([PERMIT_STRUCT, 'bytes'], [data.values, signedMessage])],
		}
	}
}
