import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PricesMap } from 'sdk/types/common';

import { PricesState } from './types';

const initialState: PricesState = {
	onChainPrices: {},
	offChainPrices: {},
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
	},
});

export const { setOffChainPrices, setOnChainPrices } = pricesSlice.actions;

export default pricesSlice.reducer;
