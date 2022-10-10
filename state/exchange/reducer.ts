import { createSlice } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { truncateNumbers } from 'utils/formatters/number';

import {
	fetchBalances,
	fetchRates,
	fetchTransactionFee,
	fetchTxProvider,
	submitExchange,
} from './actions';
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
	totalRedeemableBalance: undefined,
	estimatedBaseTradePrice: undefined,
};

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState,
	reducers: {
		setQuoteCurrencyKey: (state, action) => {
			state.baseAmount = '';

			state.quoteCurrencyKey = action.payload.currencyKey;
			state.baseCurrencyKey =
				state.baseCurrencyKey === action.payload.currencyKey ? undefined : state.baseCurrencyKey;

			if (state.txProvider === 'synthetix' && !!state.quoteAmount && !!state.baseCurrencyKey) {
				const baseAmountNoFee = wei(state.quoteAmount).mul(state.rate ?? 0);
				const fee = baseAmountNoFee.mul(state.exchangeFeeRate ?? 0);

				state.baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			}
		},
		setBaseCurrencyKey: (state, action) => {
			state.quoteAmount = '';

			state.baseCurrencyKey = action.payload.currencyKey;
			state.quoteCurrencyKey =
				state.quoteCurrencyKey === action.payload.currencyKey ? undefined : state.quoteCurrencyKey;

			if (state.txProvider === 'synthetix' && !!state.baseAmount && !!state.quoteCurrencyKey) {
				const inverseRate = wei(state.rate ?? 0).gt(0) ? wei(1).div(state.rate) : wei(0);
				const quoteAmountNoFee = wei(state.baseAmount).mul(inverseRate);
				const fee = quoteAmountNoFee.mul(state.exchangeFeeRate ?? 0);

				state.quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			}
		},
		setCurrencyPair: (state, action) => {
			state.baseCurrencyKey = action.payload.baseCurrencyKey;
			state.quoteCurrencyKey = action.payload.quoteCurrencyKey;
		},
		setBaseAmount: (state, action) => {
			state.ratio = undefined;

			if (action.payload.value === '') {
				state.baseAmount = '';
				state.quoteAmount = '';
			} else {
				state.baseAmount = action.payload.value;

				if (state.txProvider === 'synthetix' && !!state.quoteCurrencyKey) {
					const inverseRate = wei(state.rate || 0).gt(0) ? wei(1).div(state.rate) : wei(0);
					const quoteAmountNoFee = wei(action.payload.value).mul(inverseRate);
					const fee = quoteAmountNoFee.mul(state.exchangeFeeRate ?? 0);
					state.quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
				}
			}
		},
		setQuoteAmount: (state, action) => {
			state.ratio = undefined;

			if (action.payload.value === '') {
				state.quoteAmount = '';
				state.baseAmount = '';
			} else {
				state.quoteAmount = action.payload.value;

				if (state.txProvider === 'synthetix' && !!state.baseCurrencyKey) {
					const baseAmountNoFee = wei(action.payload.value).mul(state.rate ?? 0);
					const fee = baseAmountNoFee.mul(state.exchangeFeeRate ?? 0);
					state.baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
				}
			}
		},
		setRatio: (state, action) => {
			state.ratio = action.payload.ratio;

			const newQuote = truncateNumbers(
				wei(state.quoteBalance || 0).mul(action.payload.ratio / 100),
				DEFAULT_CRYPTO_DECIMALS
			);

			state.quoteAmount = newQuote;

			if (state.txProvider === 'synthetix' && !!state.baseCurrencyKey) {
				const baseAmountNoFee = wei(newQuote).mul(state.rate ?? 0);
				const fee = baseAmountNoFee.mul(state.exchangeFeeRate ?? 0);
				state.baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			}
		},
		swapCurrencies: (state) => {
			const temp = state.quoteCurrencyKey;

			state.quoteCurrencyKey = state.baseCurrencyKey;
			state.baseCurrencyKey = temp;

			state.baseAmount = state.txProvider === 'synthetix' ? state.quoteAmount : '';
			state.quoteAmount = '';
		},
		setMaxQuoteBalance: (state) => {
			if (!!state.quoteBalance) {
				if (state.quoteCurrencyKey === 'ETH') {
					const ETH_TX_BUFFER = 0.006;
					const balanceWithBuffer = wei(state.quoteBalance).sub(wei(ETH_TX_BUFFER));
					state.quoteAmount = balanceWithBuffer.lt(0)
						? '0'
						: truncateNumbers(balanceWithBuffer, DEFAULT_CRYPTO_DECIMALS);
				} else {
					state.quoteAmount = truncateNumbers(state.quoteBalance, DEFAULT_CRYPTO_DECIMALS);
				}

				if (state.txProvider === 'synthetix') {
					const baseAmountNoFee = wei(state.quoteBalance).mul(state.rate ?? 0);
					const fee = baseAmountNoFee.mul(state.exchangeFeeRate ?? 0);
					state.baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
				}
			}
		},
		setMaxBaseBalance: (state) => {
			if (!!state.baseBalance) {
				state.baseAmount = truncateNumbers(state.baseBalance, DEFAULT_CRYPTO_DECIMALS);

				if (state.txProvider) {
					const inverseRate = wei(state.rate || 0).gt(0) ? wei(1).div(state.rate) : wei(0);
					const baseAmountNoFee = wei(state.baseBalance).mul(inverseRate);
					const fee = baseAmountNoFee.mul(state.exchangeFeeRate ?? 0);
					state.quoteAmount = truncateNumbers(baseAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS);
				}
			}
		},
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
			state.feeCost = action.payload.feeCost;
		});
		builder.addCase(fetchRates.fulfilled, (state, action) => {
			state.rate = action.payload.rate;
			state.exchangeFeeRate = action.payload.exchangeFeeRate;
			state.baseFeeRate = action.payload.baseFeeRate;
		});
		builder.addCase(fetchTxProvider.fulfilled, (state, action) => {
			state.txProvider = action.payload;
		});
		builder.addCase(submitExchange.pending, (state) => {
			state.isSubmitting = true;
		});
		builder.addCase(submitExchange.fulfilled, (state) => {
			state.isSubmitting = false;
		});
	},
});

export const {
	setBaseAmount,
	setQuoteAmount,
	setRatio,
	swapCurrencies,
	setCurrencyPair,
	setQuoteCurrencyKey,
	setBaseCurrencyKey,
	setMaxQuoteBalance,
	setMaxBaseBalance,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
