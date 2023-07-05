import { Period } from '@kwenta/sdk/constants'
import {
	NetworkId,
	TransactionStatus,
	SmartMarginOrderType,
	FuturesMarket,
	FuturesOrderTypeDisplay,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	PositionSide,
	ConditionalOrder as CrossMarginOrder,
	FuturesMarketKey,
	FuturesMarketAsset,
	MarginTransfer,
	FuturesAccountType,
	FuturesFilledPosition,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

import { PricesInfo } from 'state/prices/types'
import { QueryStatus } from 'state/types'

export type TradeSizeInputs<T = Wei> = {
	nativeSize: T
	susdSize: T
}

export type SLTPInputs<T = Wei> = {
	stopLossPrice?: T
	takeProfitPrice?: T
}

export type CrossMarginTradeInputs<T = Wei> = TradeSizeInputs<T> & {
	stopLossPrice?: T
	takeProfitPrice?: T
}

export type EditPositionInputs<T = Wei> = {
	nativeSizeDelta: T
	marginDelta: T
}

export type ClosePositionInputsCrossMargin<T = Wei> = {
	nativeSizeDelta: T
	price?: {
		value?: string | undefined | null
		invalidLabel: string | undefined | null
	}
	orderType: SmartMarginOrderType
}

export type ClosePositionInputsIsolatedMargin<T = Wei> = {
	nativeSizeDelta: T
	orderType: 'market'
}

export type MarkPrices<T = Wei> = Partial<Record<FuturesMarketKey, T>>

export type MarkPriceInfos<T = Wei> = Partial<Record<FuturesMarketKey, PricesInfo<T>>>

export type FundingRate<T = Wei> = {
	asset: FuturesMarketKey
	fundingTitle: string
	fundingRate: T | null
}

export type FuturesAction = {
	account: string
	timestamp: number
	asset: FuturesMarketAsset
	margin: number
	size: number
	action: 'trade' | 'deposit' | 'withdraw'
}

export type IsolatedPerpsPortfolio = {
	account: string
	timestamp: number
	assets: {
		[asset: string]: number
	}
	total: number
}

export type SmartPerpsPortfolio = {
	account: string
	timestamp: number
	assets: {
		[asset: string]: number
	}
	idle: number
	total: number
}

export type PortfolioValues = {
	timestamp: number
	total: number
}

export type FuturesQueryStatuses = {
	markets: QueryStatus
	crossMarginBalanceInfo: QueryStatus
	dailyVolumes: QueryStatus
	crossMarginPositions: QueryStatus
	crossMarginPositionHistory: QueryStatus
	isolatedPositions: QueryStatus
	isolatedPositionHistory: QueryStatus
	openOrders: QueryStatus
	isolatedTradePreview: QueryStatus
	crossMarginTradePreview: QueryStatus
	crossMarginAccount: QueryStatus
	positionHistory: QueryStatus
	trades: QueryStatus
	selectedTraderPositionHistory: QueryStatus
	marginTransfers: QueryStatus
	historicalFundingRates: QueryStatus
}

export type FuturesTransactionType =
	| 'deposit_cross_margin'
	| 'withdraw_cross_margin'
	| 'approve_cross_margin'
	| 'deposit_isolated'
	| 'withdraw_isolated'
	| 'modify_isolated'
	| 'close_isolated'
	| 'close_cross_margin'
	| 'cancel_delayed_isolated'
	| 'execute_delayed_isolated'
	| 'close_cross_margin'
	| 'submit_cross_order'
	| 'cancel_cross_margin_order'
	| 'withdraw_keeper_balance'
	| 'create_cross_margin_account'

export type FuturesTransaction = {
	type: FuturesTransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}

export type TransactionEstimation<T = Wei> = {
	error?: string | null
	limit: T
	cost: T
}

export type TransactionEstimations = Record<FuturesTransactionType, TransactionEstimation<string>>

export type TransactionEstimationPayload = {
	type: FuturesTransactionType
	limit: string
	cost: string
	error?: string | null
}

export type CrossMarginBalanceInfo<T = Wei> = {
	freeMargin: T
	keeperEthBal: T
	allowance: T
	walletEthBal: T
}

export type CrossMarginTradeFees<T = Wei> = {
	delayedOrderFee: T
	keeperEthDeposit: T
}

type FuturesErrors = {
	tradePreview?: string | undefined | null
}

type FuturesNetwork = number

export type InputCurrencyDenomination = 'usd' | 'native'

export type FundingRatePeriods = {
	[key: number]: string
}

export type AccountContext = {
	type: FuturesAccountType
	network: NetworkId
	wallet: string
	cmAccount?: string
}

export type PreviewAction = 'edit' | 'trade' | 'close'

export type FuturesAccountData = {
	position?: FuturesPosition<string>
	positions?: FuturesPosition<string>[]
	positionHistory?: FuturesPositionHistory<string>[]
	trades?: FuturesTrade<string>[]
	marginTransfers?: MarginTransfer[]
}

export type IsolatedAccountData = FuturesAccountData & {
	delayedOrders: DelayedOrderWithDetails<string>[]
}

export type CrossMarginAccountData = FuturesAccountData & {
	account: string
	idleTransfers: MarginTransfer[]
	balanceInfo: CrossMarginBalanceInfo<string>
	delayedOrders: DelayedOrderWithDetails<string>[]
	conditionalOrders: CrossMarginOrder<string>[]
}

// TODO: Separate in some way by network and wallet
// so we can have persisted state between switching

export type FuturesState = {
	selectedType: FuturesAccountType
	confirmationModalOpen: boolean
	isolatedMargin: IsolatedMarginState
	fundingRates: FundingRate<string>[]
	crossMargin: CrossMarginState
	markets: Record<FuturesNetwork, FuturesMarket<string>[]>
	queryStatuses: FuturesQueryStatuses
	dailyMarketVolumes: FuturesVolumes<string>
	transactionEstimations: TransactionEstimations
	errors: FuturesErrors
	selectedInputDenomination: InputCurrencyDenomination
	selectedInputHours: number
	selectedChart: 'price' | 'funding'
	preferences: {
		showHistory?: boolean
	}
	dashboard: {
		selectedPortfolioTimeframe: Period
	}
	leaderboard: {
		selectedTrader: string | undefined
		selectedTraderPositionHistory: Record<
			FuturesNetwork,
			{
				[wallet: string]: FuturesPositionHistory<string>[]
			}
		>
	}
	tradePanelDrawerOpen: boolean
	historicalFundingRatePeriod: Period
	historicalFundingRates: Partial<
		Record<FuturesMarketAsset, { timestamp: string; funding: string }[]>
	>
}

export type TradePreviewResult = {
	data: FuturesPotentialTradeDetails<string> | null
	error: string | null
}

export type CrossMarginState = {
	tradeInputs: CrossMarginTradeInputs<string>
	editPositionInputs: EditPositionInputs<string>
	sltpModalInputs: SLTPInputs<string>
	marginDelta: string
	orderType: SmartMarginOrderType
	closePositionOrderInputs: ClosePositionInputsCrossMargin<string>
	orderFeeCap: string
	leverageInput: string
	selectedLeverageByAsset: Partial<Record<FuturesMarketKey, string>>
	leverageSide: PositionSide
	selectedMarketKey: FuturesMarketKey
	selectedMarketAsset: FuturesMarketAsset
	showCrossMarginOnboard: boolean
	previews: {
		trade: FuturesPotentialTradeDetails<string> | null
		close: FuturesPotentialTradeDetails<string> | null
		edit: FuturesPotentialTradeDetails<string> | null
	}
	previewDebounceCount: number
	fees: CrossMarginTradeFees<string>
	depositApproved: boolean
	cancellingOrder: number | undefined
	accounts: Record<
		FuturesNetwork,
		{
			[wallet: string]: CrossMarginAccountData
		}
	>

	orderPrice: {
		price?: string | undefined | null
		invalidLabel: string | undefined | null
	}
}

export type IsolatedMarginState = {
	tradeInputs: TradeSizeInputs<string>
	editPositionInputs: EditPositionInputs<string>
	orderType: 'market'
	previews: {
		trade: FuturesPotentialTradeDetails<string> | null
		close: FuturesPotentialTradeDetails<string> | null
		edit: FuturesPotentialTradeDetails<string> | null
	}
	closePositionOrderInputs: ClosePositionInputsIsolatedMargin<string>
	previewDebounceCount: number
	leverageSide: PositionSide
	selectedMarketKey: FuturesMarketKey
	selectedMarketAsset: FuturesMarketAsset
	leverageInput: string
	tradeFee: string
	accounts: Record<
		FuturesNetwork,
		{
			[wallet: string]: IsolatedAccountData
		}
	>
}

export type ModifyIsolatedPositionInputs = {
	delayed: boolean
	offchain: boolean
}

export type CancelDelayedOrderInputs = {
	marketAddress: string
	isOffchain: boolean
}

export type ExecuteDelayedOrderInputs = {
	marketKey: FuturesMarketKey
	marketAddress: string
	isOffchain: boolean
}

export type DelayedOrderWithDetails<T = Wei> = {
	account: string
	marketAddress: string
	market: string
	asset: FuturesMarketAsset
	marketKey: FuturesMarketKey
	size: T
	commitDeposit: T
	keeperDeposit: T
	submittedAtTimestamp: number
	executableAtTimestamp: number
	isOffchain: boolean
	desiredFillPrice: T
	targetRoundId: T | null
	orderType: FuturesOrderTypeDisplay
	side: PositionSide
	isStale?: boolean
	isExecutable?: boolean
	isCancelling?: boolean
}

export type TradePreviewParams = {
	market: {
		key: FuturesMarketKey
		address: string
	}
	orderPrice: Wei
	sizeDelta: Wei
	marginDelta: Wei
	action: PreviewAction
}

export type DebouncedPreviewParams = TradePreviewParams & {
	debounceCount: number
}

export type SharePositionParams = {
	asset?: FuturesMarketAsset
	position?: FuturesFilledPosition
	positionHistory?: FuturesPositionHistory
	marketPrice?: Wei
}

export const futuresPositionKeys = new Set([
	'remainingMargin',
	'accessibleMargin',
	'order.fee',
	'order.leverage',
	'position.notionalValue',
	'position.accruedFunding',
	'position.initialMargin',
	'position.profitLoss',
	'position.lastPrice',
	'position.size',
	'position.liquidationPrice',
	'position.initialLeverage',
	'position.leverage',
	'position.pnl',
	'position.pnlPct',
	'position.marginRatio',
])

export const futuresPositionHistoryKeys = new Set([
	'size',
	'feesPaid',
	'netFunding',
	'netTransfers',
	'totalDeposits',
	'initialMargin',
	'margin',
	'entryPrice',
	'avgEntryPrice',
	'exitPrice',
	'leverage',
	'pnl',
	'pnlWithFeesPaid',
	'totalVolume',
])
