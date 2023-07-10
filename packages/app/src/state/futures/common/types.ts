import {
	FuturesMarginType,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesOrderTypeDisplay,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesTrade,
	MarginTransfer,
	NetworkId,
	PositionSide,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

import { QueryStatus } from 'state/types'

type excludedOptions = typeof FuturesMarginType.ISOLATED_MARGIN_LEGACY
export type AppFuturesMarginType = Exclude<FuturesMarginType, excludedOptions>

export type FuturesAccountData = {
	account: string
	position?: FuturesPosition<string>
	positions?: FuturesPosition<string>[]
	positionHistory?: FuturesPositionHistory<string>[]
	trades?: FuturesTrade<string>[]
	marginTransfers?: MarginTransfer[]
	delayedOrders: DelayedOrderWithDetails<string>[]
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

export type HistoricalFundingRates = Partial<
	Record<FuturesMarketAsset, { timestamp: string; funding: string }[]>
>

export type FuturesQueryStatuses = {
	markets: QueryStatus
	smartMarginBalanceInfo: QueryStatus
	dailyVolumes: QueryStatus
	positions: QueryStatus
	positionHistory: QueryStatus
	openOrders: QueryStatus
	smartMarginTradePreview: QueryStatus
	crossMarginTradePreview: QueryStatus
	account: QueryStatus
	trades: QueryStatus
	selectedTraderPositionHistory: QueryStatus
	marginTransfers: QueryStatus
	historicalFundingRates: QueryStatus
}

export type TradeSizeInputs<T = Wei> = {
	nativeSize: T
	susdSize: T
}

export type EditPositionInputs<T = Wei> = {
	nativeSizeDelta: T
	marginDelta: T
}

export type PreviewAction = 'edit' | 'trade' | 'close'

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

export type AccountContext = {
	type: AppFuturesMarginType
	network: NetworkId
	wallet: string
	cmAccount?: string
}

export type FuturesTransactionType =
	| 'deposit_smart_margin'
	| 'withdraw_smart_margin'
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
