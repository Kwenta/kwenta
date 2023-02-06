import { FUTURES_INITIAL_STATE } from './futures/reducer';
import { PRICES_INITIAL_STATE } from './prices/reducer';

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
};

export default migrations;
