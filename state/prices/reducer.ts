import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PricesMap } from 'sdk/types/prices';

import { PricesState } from './types';

const initialState: PricesState = {
	onChainPrices: {},
	offChainPrices: {},
	connectionError: null,
};

const pricesSlice = createSlice({
	name: 'prices',
	initialState,
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
});

export const { setOffChainPrices, setOnChainPrices, setConnectionError } = pricesSlice.actions;

export default pricesSlice.reducer;
