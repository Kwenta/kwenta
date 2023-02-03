import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PricesMap } from 'sdk/types/prices';
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants';
import { FetchStatus } from 'state/types';

import { fetchPreviousDayPrices } from './actions';
import { PricesState } from './types';

export const PRICES_INITIAL_STATE: PricesState = {
	onChainPrices: {},
	offChainPrices: {},
	onChainPriceColors: {},
	offChainPriceColors: {},
	connectionError: null,
	previousDayPrices: [],
	queryStatuses: {
		previousDayPrices: DEFAULT_QUERY_STATUS,
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
		setOffChainPriceColors: (state, action) => {
			state.offChainPriceColors = action.payload;
		},
		setOnChainPriceColors: (state, action) => {
			state.offChainPriceColors = action.payload;
		},
		setConnectionError: (state, action) => {
			state.connectionError = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Fetch past daily prices
		builder.addCase(fetchPreviousDayPrices.pending, (pricesState) => {
			pricesState.queryStatuses.previousDayPrices = LOADING_STATUS;
		});
		builder.addCase(fetchPreviousDayPrices.fulfilled, (pricesState, action) => {
			pricesState.previousDayPrices = action.payload;
			pricesState.queryStatuses.previousDayPrices = SUCCESS_STATUS;
		});
		builder.addCase(fetchPreviousDayPrices.rejected, (pricesState) => {
			pricesState.queryStatuses.previousDayPrices = {
				error: 'Failed to fetch past prices',
				status: FetchStatus.Error,
			};
		});
	},
});

export const {
	setOffChainPrices,
	setOnChainPrices,
	setOffChainPriceColors,
	setOnChainPriceColors,
	setConnectionError,
} = pricesSlice.actions;

export default pricesSlice.reducer;
