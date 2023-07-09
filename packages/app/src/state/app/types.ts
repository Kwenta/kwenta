import { TransactionStatus, FuturesMarketKey, KwentaStatus, GasPrice } from '@kwenta/sdk/types'
import { FuturesTransactionType } from 'state/futures/shared.ts/types'

export type ModalType =
	| 'futures_close_position_confirm'
	| 'futures_cross_withdraw'
	| 'futures_isolated_transfer'
	| 'futures_confirm_smart_margin_trade'
	| 'futures_confirm_isolated_margin_trade'
	| 'futures_withdraw_keeper_balance'
	| 'futures_smart_margin_onboard'
	| 'futures_smart_margin_socket'
	| null

export type FuturesPositionModalType =
	| 'futures_close_position'
	| 'futures_edit_position_margin'
	| 'futures_edit_position_size'
	| 'futures_edit_stop_loss_take_profit'

export type GasSpeed = 'average' | 'fast' | 'fastest'

export type TransactionType = FuturesTransactionType // TODO: Support all types

export type Transaction = {
	type: TransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}

export type AppState = {
	showModal?: ModalType
	showPositionModal?: { type: FuturesPositionModalType; marketKey: FuturesMarketKey } | null
	gasSpeed: GasSpeed
	gasPrice: GasPrice<string>
	transaction?: Transaction | undefined
	synthetixOnMaintenance: boolean
	kwentaStatus: KwentaStatus
	acknowledgedOrdersWarning: boolean
	showBanner: boolean
}
