import { configureStore } from '@reduxjs/toolkit';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import KwentaSDK from 'sdk';

import balancesReducer from './balances/reducer';
import { sdk } from './config';
import exchangeReducer from './exchange/reducer';
import walletReducer from './wallet/reducer';

const LOG_REDUX = process.env.NODE_ENV !== 'production';

const store = configureStore({
	reducer: {
		wallet: walletReducer,
		balances: balancesReducer,
		exchange: exchangeReducer,
	},
	middleware: (getDefaultMiddleware) => {
		const baseMiddleware = getDefaultMiddleware({ thunk: { extraArgument: { sdk } } });
		return LOG_REDUX ? baseMiddleware.concat(logger) : baseMiddleware;
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type ThunkConfig = {
	dispatch: AppDispatch;
	state: RootState;
	extra: { sdk: KwentaSDK };
};
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	{ sdk: KwentaSDK },
	AnyAction
>;

export default store;
