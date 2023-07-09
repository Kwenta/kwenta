import {
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesOrderTypeDisplay,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesTrade,
	MarginTransfer,
	PositionSide,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

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
