import { Period } from '@kwenta/sdk/constants'
import {
	NetworkId,
	TransactionStatus,
	FuturesOrderTypeDisplay,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	PositionSide,
	FuturesMarketKey,
	FuturesMarketAsset,
	MarginTransfer,
	FuturesFilledPosition,
	FuturesMarket,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'
import { AppFuturesMarginType } from 'state/futures/types'

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

export type TradeInputs<T = Wei> = TradeSizeInputs<T> & {
	stopLossPrice?: T
	takeProfitPrice?: T
}

export type EditPositionInputs<T = Wei> = {
	nativeSizeDelta: T
	marginDelta: T
}

export type ClosePositionInputs<T = Wei> = {
	nativeSizeDelta: T
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

export type PerpsV3Portfolio = {
	account: string
	timestamp: number
	assets: {
		[asset: string]: number
	}
	total: number
}

export type PortfolioValues = {
	timestamp: number
	total: number
}

export type FuturesQueryStatuses = {
	markets: QueryStatus
	dailyVolumes: QueryStatus
	perpsV3Positions: QueryStatus
	perpsV3PositionHistory: QueryStatus
	openOrders: QueryStatus
	perpsV3TradePreview: QueryStatus
	perpsV3Account: QueryStatus
	positionHistory: QueryStatus
	trades: QueryStatus
	selectedTraderPositionHistory: QueryStatus
	marginTransfers: QueryStatus
	historicalFundingRates: QueryStatus
}

export type PerpsV3TransactionType =
	| 'deposit_perps_v3'
	| 'withdraw_perps_v3'
	| 'approve_perps_v3'
	| 'modify_perps_v3'
	| 'close_perps_v3'
	| 'cancel_delayed_perps_v3'
	| 'execute_delayed_perps_v3'
	| 'create_account_perps_v3'

export type PerpsV3Transaction = {
	type: PerpsV3TransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}

type FuturesNetwork = number

export type InputCurrencyDenomination = 'usd' | 'native'

export type FundingRatePeriods = {
	[key: number]: string
}

export type AccountContext = {
	type: AppFuturesMarginType
	network: NetworkId
	wallet: string
	cmAccount?: string
}

export type PreviewAction = 'edit' | 'trade' | 'close'

export type PerpsV3AccountData = {
	account: string
	position?: FuturesPosition<string>
	positions?: FuturesPosition<string>[]
	positionHistory?: FuturesPositionHistory<string>[]
	trades?: FuturesTrade<string>[]
	marginTransfers?: MarginTransfer[]
	delayedOrders: DelayedOrderWithDetails<string>[]
}

export type PerpsV3State = {
	markets: Record<FuturesNetwork, FuturesMarket<string>[]>
	tradeInputs: TradeSizeInputs<string>
	editPositionInputs: EditPositionInputs<string>
	orderType: 'market'
	previews: {
		trade: FuturesPotentialTradeDetails<string> | null
		close: FuturesPotentialTradeDetails<string> | null
		edit: FuturesPotentialTradeDetails<string> | null
	}
	selectedType: AppFuturesMarginType
	confirmationModalOpen: boolean
	closePositionOrderInputs: ClosePositionInputs<string>
	previewDebounceCount: number
	leverageSide: PositionSide
	selectedMarketKey: FuturesMarketKey
	selectedMarketAsset: FuturesMarketAsset
	leverageInput: string
	tradeFee: string
	accounts: Record<
		FuturesNetwork,
		{
			[wallet: string]: PerpsV3AccountData
		}
	>
	fundingRates: FundingRate<string>[]
	queryStatuses: FuturesQueryStatuses
	dailyMarketVolumes: FuturesVolumes<string>
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
	historicalFundingRates: Partial<
		Record<FuturesMarketAsset, { timestamp: string; funding: string }[]>
	>
}

export type TradePreviewResult = {
	data: FuturesPotentialTradeDetails<string> | null
	error: string | null
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
