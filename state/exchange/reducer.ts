import { createSlice } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { truncateNumbers } from 'utils/formatters/number';

import {
	fetchBalances,
	fetchFeeReclaimPeriod,
	fetchNumEntries,
	fetchTokenList,
	fetchTransactionFee,
	fetchTxProvider,
	resetCurrencyKeys,
	submitApprove,
	submitExchange,
	submitRedeem,
	submitSettle,
	updateBaseAmount,
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
	quotePriceRate: undefined,
	basePriceRate: undefined,
	baseFeeRate: undefined,
	rate: undefined,
	numEntries: 0,
	redeemableSynthBalances: [],
	totalRedeemableBalance: undefined,
	estimatedBaseTradePrice: undefined,
	approvalStatus: undefined,
	tokenListLoading: false,
	synthsMap: {},
	tokensMap: {},
	tokenList: [],
	txHash: undefined,
	feeReclaimPeriod: 0,
	settlementWaitingPeriod: 0,
	openModal: undefined,
	oneInchQuote: '',
	oneInchQuoteLoading: false,
	oneInchQuoteError: false,
	txError: undefined,
};

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState,
	reducers: {
		setQuoteAmount: (state, action) => {
			state.ratio = undefined;
			state.quoteAmount = action.payload;
		},
		setBaseAmount: (state, action) => {
			state.ratio = undefined;

			if (action.payload === '') {
				state.baseAmount = '';
				state.quoteAmount = '';
			} else {
				state.baseAmount = action.payload;
				if (state.txProvider === 'synthetix' && !!state.quoteCurrencyKey) {
					const inverseRate = wei(state.rate || 0).gt(0) ? wei(1).div(state.rate) : wei(0);
					const quoteAmountNoFee = wei(action.payload).mul(inverseRate);
					const fee = quoteAmountNoFee.mul(state.exchangeFeeRate ?? 0);
					state.quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
				}
			}
		},
		setQuoteCurrencyKey: (state, action) => {
			state.baseAmount = '';

			state.quoteCurrencyKey = action.payload;
			state.baseCurrencyKey =
				state.baseCurrencyKey === action.payload ? undefined : state.baseCurrencyKey;

			if (state.txProvider === 'synthetix' && !!state.quoteAmount && !!state.baseCurrencyKey) {
				const baseAmountNoFee = wei(state.quoteAmount).mul(state.rate ?? 0);
				const fee = baseAmountNoFee.mul(state.exchangeFeeRate ?? 0);

				state.baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			}
		},
		setBaseCurrencyKey: (state, action) => {
			state.quoteAmount = '';

			state.baseCurrencyKey = action.payload;
			state.quoteCurrencyKey =
				state.quoteCurrencyKey === action.payload ? undefined : state.quoteCurrencyKey;

			if (state.txProvider === 'synthetix' && !!state.baseAmount && !!state.quoteCurrencyKey) {
				const inverseRate = wei(state.rate ?? 0).gt(0) ? wei(1).div(state.rate) : wei(0);
				const quoteAmountNoFee = wei(state.baseAmount).mul(inverseRate);
				const fee = quoteAmountNoFee.mul(state.exchangeFeeRate ?? 0);

				state.quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			}
		},
		setRatio: (state, action) => {
			state.ratio = action.payload;

			const newQuote = truncateNumbers(
				wei(state.quoteBalance || 0).mul(action.payload / 100),
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

			const tempBalance = state.quoteBalance;
			state.quoteBalance = state.baseBalance;
			state.baseBalance = tempBalance;
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
					const fee = baseAmountNoFee.mul(wei(state.exchangeFeeRate ?? 0));
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
		setOpenModal: (state, action) => {
			state.openModal = action.payload;
		},
		closeModal: (state) => {
			state.openModal = undefined;
		},
		setApprovalStatus: (state, action) => {
			state.approvalStatus = action.payload;
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
		builder.addCase(fetchTxProvider.fulfilled, (state, action) => {
			state.txProvider = action.payload;
		});
		builder.addCase(submitExchange.pending, (state) => {
			state.isSubmitting = true;
			state.openModal = 'confirm';
			state.txError = undefined;
		});
		builder.addCase(submitExchange.fulfilled, (state) => {
			state.isSubmitting = false;
			state.openModal = undefined;
		});
		builder.addCase(submitExchange.rejected, (state, action) => {
			state.isSubmitting = false;
			state.openModal = undefined;
			state.txError = action.error.message;
		});
		builder.addCase(submitApprove.pending, (state) => {
			state.approvalStatus = 'approving';
			state.openModal = 'approve';
			state.txError = undefined;
		});
		builder.addCase(submitApprove.fulfilled, (state) => {
			state.openModal = undefined;
		});
		builder.addCase(submitApprove.rejected, (state, action) => {
			state.openModal = undefined;
			state.txError = action.error.message;
		});
		builder.addCase(submitRedeem.pending, (state) => {
			state.openModal = 'redeem';
			state.txError = undefined;
		});
		builder.addCase(submitRedeem.fulfilled, (state) => {
			state.openModal = undefined;
		});
		builder.addCase(submitRedeem.rejected, (state, action) => {
			state.openModal = undefined;
			state.txError = action.error.message;
		});
		builder.addCase(submitSettle.pending, (state) => {
			state.openModal = 'settle';
			state.txError = undefined;
		});
		builder.addCase(submitSettle.fulfilled, (state) => {
			state.openModal = undefined;
		});
		builder.addCase(submitSettle.rejected, (state, action) => {
			state.openModal = undefined;
			state.txError = action.error.message;
		});
		builder.addCase(fetchTokenList.pending, (state) => {
			state.tokenListLoading = true;
		});
		builder.addCase(fetchTokenList.fulfilled, (state, action) => {
			state.tokenListLoading = false;
			state.synthsMap = action.payload.synthsMap;
			state.tokensMap = action.payload.tokensMap;
			state.tokenList = action.payload.tokenList;
		});
		builder.addCase(fetchTokenList.rejected, (state) => {
			state.tokenListLoading = false;
		});
		builder.addCase(fetchFeeReclaimPeriod.fulfilled, (state, action) => {
			state.feeReclaimPeriod = action.payload.feeReclaimPeriod;
			state.settlementWaitingPeriod = action.payload.settlementWaitingPeriod;
		});
		builder.addCase(fetchNumEntries.fulfilled, (state, action) => {
			state.numEntries = action.payload;
		});
		builder.addCase(updateBaseAmount.pending, (state) => {
			if (!!state.txProvider && state.txProvider !== 'synthetix') {
				state.oneInchQuoteLoading = true;
			}
		});
		builder.addCase(updateBaseAmount.fulfilled, (state, action) => {
			state.oneInchQuoteLoading = false;
			state.baseAmount = action.payload.baseAmount;
			state.slippagePercent = action.payload.slippagePercent;
		});
		builder.addCase(updateBaseAmount.rejected, (state) => {
			state.oneInchQuoteLoading = false;
			state.oneInchQuoteError = true;
		});
		builder.addCase(resetCurrencyKeys.fulfilled, (state, action) => {
			state.baseFeeRate = action.payload.baseFeeRate;
			state.rate = action.payload.rate;
			state.exchangeFeeRate = action.payload.exchangeFeeRate;
			state.quotePriceRate = action.payload.quotePriceRate;
			state.basePriceRate = action.payload.basePriceRate;
			state.txProvider = action.payload.txProvider;
			state.approvalStatus = action.payload.approvalStatus;
		});
	},
});

export const {
	setQuoteAmount,
	setBaseAmount,
	setRatio,
	swapCurrencies,
	setQuoteCurrencyKey,
	setBaseCurrencyKey,
	setMaxQuoteBalance,
	setMaxBaseBalance,
	setOpenModal,
	closeModal,
	setApprovalStatus,
} = exchangeSlice.actions;

export default exchangeSlice.reducer;
