import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import logger from 'redux-logger';
import KwentaSDK from 'sdk';

import { wagmiClient } from 'containers/Connector/config';

import { fetchSynthBalances } from './balances/actions';
import balancesReducer from './balances/reducer';
import { fetchBalances } from './exchange/actions';
import exchangeReducer from './exchange/reducer';
import walletReducer from './wallet/reducer';

export const sdk = new KwentaSDK(10, wagmiClient.provider, undefined);

sdk.events.on('signer_connected', () => {
	store.dispatch(fetchSynthBalances());
	store.dispatch(fetchBalances());
});

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

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
