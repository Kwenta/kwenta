import { FuturesMarket } from '@kwenta/sdk/types';
import { createSlice } from '@reduxjs/toolkit';

import { FetchStatus } from 'state/types';

import { fetchOptimismMarkets } from './actions';

type HomeState = {
	optimismMarkets: FuturesMarket<string>[];
	marketsQueryStatus: FetchStatus;
};

export const HOME_INITIAL_STATE: HomeState = {
	optimismMarkets: [],
	marketsQueryStatus: FetchStatus.Idle,
};

export const homeSlice = createSlice({
	name: 'home',
	initialState: HOME_INITIAL_STATE,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchOptimismMarkets.pending, (state) => {
			state.marketsQueryStatus = FetchStatus.Loading;
		});
		builder.addCase(fetchOptimismMarkets.fulfilled, (state, action) => {
			state.optimismMarkets = action.payload.markets;
		});
		builder.addCase(fetchOptimismMarkets.rejected, (state) => {
			state.marketsQueryStatus = FetchStatus.Error;
		});
	},
});

export default homeSlice.reducer;
