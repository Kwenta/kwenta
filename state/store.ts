import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import logger from 'redux-logger';
import KwentaSDK from 'sdk';

import { wagmiClient } from 'containers/Connector/config';

import balancesReducer from './balances/reducer';
import walletReducer from './wallet/reducer';

const sdk = new KwentaSDK(10, wagmiClient.provider);

const store = configureStore({
	reducer: {
		wallet: walletReducer,
		balances: balancesReducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({ thunk: { extraArgument: { sdk } } }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
