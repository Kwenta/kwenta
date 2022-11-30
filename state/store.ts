import { configureStore } from '@reduxjs/toolkit';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import KwentaSDK from 'sdk';

import appReducer from './app/reducer';
import balancesReducer from './balances/reducer';
import { sdk } from './config';
import earnReducer from './earn/reducer';
import exchangeReducer from './exchange/reducer';
import futuresReducer from './futures/reducer';
import homeReducer from './home/reducer';
import walletReducer from './wallet/reducer';

const LOG_REDUX = process.env.NODE_ENV !== 'production';

const store = configureStore({
	reducer: {
		app: appReducer,
		wallet: walletReducer,
		balances: balancesReducer,
		exchange: exchangeReducer,
		futures: futuresReducer,
		home: homeReducer,
		earn: earnReducer,
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
