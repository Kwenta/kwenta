import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import {
	createMigrate,
	persistReducer,
	persistStore,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import KwentaSDK from 'sdk';

import appReducer from './app/reducer';
import balancesReducer from './balances/reducer';
import { sdk } from './config';
import earnReducer from './earn/reducer';
import exchangeReducer from './exchange/reducer';
import futuresReducer from './futures/reducer';
import homeReducer from './home/reducer';
import migrations from './migrations';
import preferencesReducer from './preferences/reducer';
import pricesReducer from './prices/reducer';
import stakingReducer from './staking/reducer';
import statsReducer from './stats/reducer';
import walletReducer from './wallet/reducer';

const LOG_REDUX = process.env.NODE_ENV !== 'production';

const persistConfig = {
	key: 'root1',
	storage,
	version: 7,
	blacklist: ['app', 'wallet'],
	migrate: createMigrate(migrations, { debug: true }),
};

const combinedReducers = combineReducers({
	app: appReducer,
	wallet: walletReducer,
	balances: balancesReducer,
	exchange: exchangeReducer,
	futures: futuresReducer,
	home: homeReducer,
	earn: earnReducer,
	staking: stakingReducer,
	preferenes: preferencesReducer,
	prices: pricesReducer,
	stats: statsReducer,
});

const persistedReducer = persistReducer(persistConfig, combinedReducers);

const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) => {
		const baseMiddleware = getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
			thunk: { extraArgument: { sdk } },
		});
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

export const persistor = persistStore(store);

export default store;
