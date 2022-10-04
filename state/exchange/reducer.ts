import { createSlice } from '@reduxjs/toolkit';

import { ExchangeState } from './types';

const initialState: ExchangeState = {
	baseCurrencyKey: undefined,
	quoteCurrencyKey: undefined,
	txProvider: undefined,
	baseAmount: '',
	quoteAmount: '',
	ratio: undefined,
};

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState,
	reducers: {
		setBaseAmount: (state, action) => {
			state.baseAmount = action.payload.baseAmount;
		},
		setQuoteAmount: (state, action) => {
			state.baseAmount = action.payload.baseAmount;
		},
		setRatio: (state, action) => {
			state.ratio = action.payload.ratio;
		},
	},
});

export default exchangeSlice.reducer;
