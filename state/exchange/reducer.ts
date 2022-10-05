import { createSlice } from '@reduxjs/toolkit';

import { fetchBalances } from './actions';
import { ExchangeState } from './types';

const initialState: ExchangeState = {
	baseCurrencyKey: undefined,
	quoteCurrencyKey: undefined,
	txProvider: undefined,
	baseAmount: '',
	quoteAmount: '',
	quoteBalance: undefined,
	baseBalance: undefined,
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
	extraReducers: (builder) => {
		builder.addCase(fetchBalances.fulfilled, (state, action) => {
			state.quoteBalance = action.payload.quoteBalance;
			state.baseBalance = action.payload.baseBalance;
		});
	},
});

export default exchangeSlice.reducer;
