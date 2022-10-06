import { createSlice } from '@reduxjs/toolkit';

import { fetchBalances, fetchTransactionFee } from './actions';
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
	transactionFee: undefined,
	slippagePercent: undefined,
	isSubmitting: false,
	isApproving: false,
};

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState,
	reducers: {
		setBaseAmount: (state, action) => {
			state.baseAmount = action.payload.baseAmount;
			state.ratio = undefined;
		},
		setQuoteAmount: (state, action) => {
			state.baseAmount = action.payload.baseAmount;
			state.ratio = undefined;
		},
		setRatio: (state, action) => {
			// This is not so simple,
			// since we need to update both the baseAmount and quoteAmount
			// here as well.
			state.ratio = action.payload.ratio;
		},
		swapCurrencies: (state) => {
			const temp = state.quoteCurrencyKey;

			state.quoteCurrencyKey = state.baseCurrencyKey;
			state.baseCurrencyKey = temp;

			state.baseAmount = state.txProvider === 'synthetix' ? state.quoteAmount : '';
			state.quoteAmount = '';
		},
		setMaxQuoteBalance: () => {},
		setMaxBaseBalance: () => {},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchBalances.fulfilled, (state, action) => {
			state.quoteBalance = action.payload.quoteBalance;
			state.baseBalance = action.payload.baseBalance;
		});
		builder.addCase(fetchTransactionFee.fulfilled, (state, action) => {
			state.transactionFee = action.payload.transactionFee;
		});
	},
});

export default exchangeSlice.reducer;
