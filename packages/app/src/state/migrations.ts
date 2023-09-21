import { APP_INITIAL_STATE } from './app/reducer'
import { BALANCES_INITIAL_STATE } from './balances/reducer'
import { EARN_INITIAL_STATE } from './earn/reducer'
import { EXCHANGES_INITIAL_STATE } from './exchange/reducer'
import { FUTURES_INITIAL_STATE } from './futures/reducer'
import { SMART_MARGIN_INITIAL_STATE } from './futures/smartMargin/reducer'
import { HOME_INITIAL_STATE } from './home/reducer'
import { PREFERENCES_INITIAL_STATE } from './preferences/reducer'
import { PRICES_INITIAL_STATE } from './prices/reducer'
import { REFERRALS_INITIAL_STATE } from './referrals/reducer'
import { STAKING_INITIAL_STATE } from './staking/reducer'
import { STAKING_MIGRATION_INITIAL_STATE } from './stakingMigration/reducer'
import { STATS_INITIAL_STATE } from './stats/reducer'
import { WALLET_INITIAL_STATE } from './wallet/reducer'

export const migrations = {
	7: (state: any) => {
		return {
			...state,
			app: APP_INITIAL_STATE,
			balances: BALANCES_INITIAL_STATE,
			earn: EARN_INITIAL_STATE,
			exchanges: EXCHANGES_INITIAL_STATE,
			futures: FUTURES_INITIAL_STATE,
			home: HOME_INITIAL_STATE,
			preferences: PREFERENCES_INITIAL_STATE,
			prices: PRICES_INITIAL_STATE,
			staking: STAKING_INITIAL_STATE,
			stats: STATS_INITIAL_STATE,
			wallet: WALLET_INITIAL_STATE,
		}
	},
	8: (state: any) => {
		return {
			...state,
			futures: FUTURES_INITIAL_STATE,
		}
	},
	22: (state: any) => {
		return {
			...state,
			home: HOME_INITIAL_STATE,
			futures: FUTURES_INITIAL_STATE,
			earn: EARN_INITIAL_STATE,
			staking: STAKING_INITIAL_STATE,
		}
	},
	29: (state: any) => {
		return {
			...state,
			futures: FUTURES_INITIAL_STATE,
			home: HOME_INITIAL_STATE,
		}
	},
	36: (state: any) => {
		return {
			...state,
			app: APP_INITIAL_STATE,
			futures: FUTURES_INITIAL_STATE,
			balances: BALANCES_INITIAL_STATE,
			staking: STAKING_INITIAL_STATE,
			prices: PRICES_INITIAL_STATE,
		}
	},
	37: (state: any) => {
		return {
			...state,
			stats: STATS_INITIAL_STATE,
		}
	},
	38: (state: any) => {
		return {
			...state,
			referral: REFERRALS_INITIAL_STATE,
		}
	},
	39: (state: any) => {
		return {
			...state,
			futures: FUTURES_INITIAL_STATE,
			smartMargin: SMART_MARGIN_INITIAL_STATE,
		}
	},
	40: (state: any) => {
		return {
			...state,
			stakingMigration: STAKING_MIGRATION_INITIAL_STATE,
		}
	},
}

export default migrations
