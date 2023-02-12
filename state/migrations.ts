import { APP_INITIAL_STATE } from './app/reducer';
import { BALANCES_INITIAL_STATE } from './balances/reducer';
import { EARN_INITIAL_STATE } from './earn/reducer';
import { EXCHANGES_INITIAL_STATE } from './exchange/reducer';
import { FUTURES_INITIAL_STATE } from './futures/reducer';
import { HOME_INITIAL_STATE } from './home/reducer';
import { PREFERENCES_INITIAL_STATE } from './preferences/reducer';
import { PRICES_INITIAL_STATE } from './prices/reducer';
import { STAKING_INITIAL_STATE } from './staking/reducer';
import { STATS_INITIAL_STATE } from './stats/reducer';
import { WALLET_INITIAL_STATE } from './wallet/reducer';

export const migrations = {
	4: (state: any) => {
		return {
			...state,
			futures: FUTURES_INITIAL_STATE,
			prices: PRICES_INITIAL_STATE,
		};
	},
	5: (state: any) => {
		return {
			...state,
			futures: FUTURES_INITIAL_STATE,
		};
	},
	6: (state: any) => {
		return {
			...state,
			prices: PRICES_INITIAL_STATE,
		};
	},
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
		};
	},
};

export default migrations;
