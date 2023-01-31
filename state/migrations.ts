import { INITIAL_STATE } from './futures/reducer';

export const migrations = {
	3: (state: any) => {
		return {
			...state,
			futures: INITIAL_STATE,
		};
	},
};

export default migrations;
