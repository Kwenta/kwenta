import KwentaSDK from '@kwenta/sdk'
import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit'
import type { AnyAction, ThunkAction } from '@reduxjs/toolkit'
import logger from 'redux-logger'
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
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import appReducer from './app/reducer'
import balancesReducer from './balances/reducer'
import earnReducer from './earn/reducer'
import exchangeReducer from './exchange/reducer'
import futuresReducer from './futures/reducer'
import homeReducer from './home/reducer'
import migrations from './migrations'
import preferencesReducer from './preferences/reducer'
import pricesReducer from './prices/reducer'
import sdk from './sdk'
import stakingReducer from './staking/reducer'
import statsReducer from './stats/reducer'
import walletReducer from './wallet/reducer'
import crossMarginReducer from './futures/crossMargin/reducer'

const LOG_REDUX = false

const persistConfig = {
	key: 'root1',
	storage,
	version: 32,
	blacklist: ['app', 'wallet'],
	migrate: createMigrate(migrations, { debug: true }),
}

const combinedReducers = combineReducers({
	app: appReducer,
	wallet: walletReducer,
	balances: balancesReducer,
	exchange: exchangeReducer,
	futures: futuresReducer,
	crossMargin: crossMarginReducer,
	home: homeReducer,
	earn: earnReducer,
	staking: stakingReducer,
	preferenes: preferencesReducer,
	prices: pricesReducer,
	stats: statsReducer,
})

const persistedReducer = persistReducer(persistConfig, combinedReducers)

export const setupStore = (preloadedState?: PreloadedState<any>) =>
	configureStore({
		reducer: persistedReducer,
		middleware: (getDefaultMiddleware) => {
			const baseMiddleware = getDefaultMiddleware({
				serializableCheck: {
					ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
				},
				thunk: { extraArgument: { sdk } },
			})
			return LOG_REDUX ? baseMiddleware.concat(logger) : baseMiddleware
		},
		preloadedState,
	})

const store = setupStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
export type ThunkConfig = {
	dispatch: AppDispatch
	state: RootState
	extra: { sdk: KwentaSDK }
}
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	{ sdk: KwentaSDK },
	AnyAction
>

export const persistor = persistStore(store)
export default store
