import { createSlice } from '@reduxjs/toolkit';

import { zeroBN } from 'utils/formatters/number';

import { fetchBalances, fetchTransactionFee } from './actions';
import { ExchangeState } from './types';

const initialState: ExchangeState = {
	baseCurrencyKey: undefined,
	quoteCurrencyKey: 'sUSD',
	txProvider: undefined,
	baseAmount: '',
	quoteAmount: '',
	quoteBalance: undefined,
	baseBalance: undefined,
	ratio: undefined,
	transactionFee: undefined,
	feeCost: undefined,
	slippagePercent: undefined,
	isSubmitting: false,
	isApproving: false,
	needsApproval: false,
	quotePriceRate: undefined,
	basePriceRate: undefined,
	baseFeeRate: undefined,
	rate: undefined,
	numEntries: 0,
	redeemableSynthBalances: [],
	totalRedeemableBalance: zeroBN,
	estimatedBaseTradePrice: zeroBN,
};

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState,
	reducers: {
		setCurrencyPair: (state, action) => {
			state.baseCurrencyKey = action.payload.baseCurrencyKey;
			state.quoteCurrencyKey = action.payload.quoteCurrencyKey;
		},
		setBaseAmount: (state, action) => {
			state.ratio = undefined;

			if (action.payload.baseAmount === '') {
				state.baseAmount = '';
				state.quoteAmount = '';
			} else {
				state.baseAmount = action.payload.baseAmount;
			}
		},
		setQuoteAmount: (state, action) => {
			state.ratio = undefined;

			if (action.payload.quoteAmount === '') {
				state.quoteAmount = '';
				state.baseAmount = '';
			} else {
				state.quoteAmount = action.payload.quoteAmount;
			}
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
			state.redeemableSynthBalances = action.payload.redeemableSynthBalances;
			state.totalRedeemableBalance = action.payload.totalRedeemableBalance;
		});
		builder.addCase(fetchTransactionFee.fulfilled, (state, action) => {
			state.transactionFee = action.payload.transactionFee;
		});
	},
});

export const {
	setBaseAmount,
	setQuoteAmount,
	setRatio,
	swapCurrencies,
	setCurrencyPair,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
