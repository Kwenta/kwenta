import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import KwentaSDK from 'sdk';

import balancesReducer from './balances/reducer';
import { sdk } from './config';
import exchangeReducer from './exchange/reducer';
import walletReducer from './wallet/reducer';

const store = configureStore({
	reducer: {
		wallet: walletReducer,
		balances: balancesReducer,
		exchange: exchangeReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ thunk: { extraArgument: { sdk } } }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type ThunkConfig = {
	dispatch: AppDispatch;
	state: RootState;
	extra: { sdk: KwentaSDK };
};

export default store;
