import { TransactionStatus, FuturesMarketKey, KwentaStatus, GasPrice } from '@kwenta/sdk/types'

import { FuturesTransactionType } from 'state/futures/common/types'
import { ReferralTransactionType } from 'state/referrals/types'
import { StakingMigrationTransactionType } from 'state/stakingMigration/types'

export type ModalType =
	| 'futures_deposit_withdraw_smart_margin'
	| 'futures_deposit_withdraw_cross_margin'
	| 'futures_confirm_smart_margin_trade'
	| 'futures_confirm_cross_margin_trade'
	| 'futures_withdraw_keeper_balance'
	| 'futures_smart_margin_onboard'
	| 'futures_cross_margin_onboard'
	| 'futures_smart_margin_socket'
	| 'referrals_create_referral_code'
	| 'referrals_mint_boost_nft'
	| null

export type FuturesPositionModalType =
	| 'smart_margin_close_position'
	| 'cross_margin_close_position'
	| 'futures_edit_position_margin'
	| 'futures_edit_position_size'
	| 'futures_edit_stop_loss_take_profit'

export type GasSpeed = 'average' | 'fast' | 'fastest'

export type TransactionType =
	| FuturesTransactionType
	| ReferralTransactionType
	| StakingMigrationTransactionType // TODO: Support all types

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
