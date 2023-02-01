import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PricesMap } from 'sdk/types/prices';
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants';
import { FetchStatus } from 'state/types';

import { fetchPreviousDayRates } from './actions';
import { PricesState } from './types';

export const PRICES_INITIAL_STATE: PricesState = {
	onChainPrices: {},
	offChainPrices: {},
	connectionError: null,
	previousDayRates: [],
	queryStatuses: {
		previousDayRates: DEFAULT_QUERY_STATUS,
	},
};

const pricesSlice = createSlice({
	name: 'prices',
	initialState: PRICES_INITIAL_STATE,
	reducers: {
		setOffChainPrices: (state, action: PayloadAction<PricesMap<string>>) => {
			state.offChainPrices = action.payload;
		},
		setOnChainPrices: (state, action) => {
			state.onChainPrices = action.payload;
		},
		setConnectionError: (state, action) => {
			state.connectionError = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Fetch past daily prices
		builder.addCase(fetchPreviousDayRates.pending, (pricesState) => {
			pricesState.queryStatuses.previousDayRates = LOADING_STATUS;
		});
		builder.addCase(fetchPreviousDayRates.fulfilled, (pricesState, action) => {
			pricesState.previousDayRates = action.payload;
			pricesState.queryStatuses.previousDayRates = SUCCESS_STATUS;
		});
		builder.addCase(fetchPreviousDayRates.rejected, (pricesState) => {
			pricesState.queryStatuses.previousDayRates = {
				error: 'Failed to fetch past rates',
				status: FetchStatus.Error,
			};
		});
	},
});

export const { setOffChainPrices, setOnChainPrices, setConnectionError } = pricesSlice.actions;

export default pricesSlice.reducer;
