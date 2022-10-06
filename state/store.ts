import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import logger from 'redux-logger';
import KwentaSDK from 'sdk';

import { wagmiClient } from 'containers/Connector/config';

import balancesReducer from './balances/reducer';
import exchangeReducer from './exchange/reducer';
import walletReducer from './wallet/reducer';

// TODO:
// - Make sure that using this static value (wagmiClient.provider)
//   is actually responsive to provider changes.
// - Figure out how to get the signer out of wagmi

export let sdk = new KwentaSDK(10, wagmiClient.provider, window.ethereum as any);

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

export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
