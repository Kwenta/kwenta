import { truncateNumbers } from '@kwenta/sdk/utils'
import { createSlice } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults'
import { FetchStatus } from 'state/types'

import {
	fetchFeeReclaimPeriod,
	fetchNumEntries,
	fetchTokenList,
	fetchTransactionFee,
	fetchWalletTrades,
	resetCurrencyKeys,
	submitApprove,
	submitExchange,
	submitSettle,
	updateBaseAmount,
} from './actions'
import { ExchangeState } from './types'

export const EXCHANGES_INITIAL_STATE: ExchangeState = {
	baseCurrencyKey: undefined,
	quoteCurrencyKey: 'sUSD',
	txProvider: undefined,
	baseAmount: '',
	quoteAmount: '',
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
	approvalStatus: FetchStatus.Idle,
	tokenListStatus: FetchStatus.Idle,
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
	isApproved: undefined,
	allowance: undefined,
	synthSuspensions: {} as ExchangeState['synthSuspensions'],
	walletTradesStatus: FetchStatus.Idle,
	walletTrades: [],
}

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState: EXCHANGES_INITIAL_STATE,
	reducers: {
		setQuoteAmount: (state, action) => {
			state.ratio = undefined
			state.quoteAmount = action.payload
		},
		setBaseAmount: (state, action) => {
			state.ratio = undefined

			if (action.payload === '') {
				state.baseAmount = ''
				state.quoteAmount = ''
			} else {
				state.baseAmount = action.payload
				if (state.txProvider === 'synthetix' && !!state.quoteCurrencyKey) {
					const inverseRate = wei(state.rate || 0).gt(0) ? wei(1).div(state.rate) : wei(0)
					const quoteAmountNoFee = wei(action.payload).mul(inverseRate)
					const fee = quoteAmountNoFee.mul(state.exchangeFeeRate ?? 0)
					state.quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
				}
			}
		},
		setQuoteAmountRaw: (state, action) => {
			state.quoteAmount = action.payload
		},
		setBaseAmountRaw: (state, action) => {
			state.baseAmount = action.payload
		},
		setQuoteCurrencyKey: (state, action) => {
			state.baseAmount = ''

			state.quoteCurrencyKey = action.payload
			state.baseCurrencyKey =
				state.baseCurrencyKey === action.payload ? undefined : state.baseCurrencyKey
		},
		setBaseCurrencyKey: (state, action) => {
			state.quoteAmount = ''

			state.baseCurrencyKey = action.payload
			state.quoteCurrencyKey =
				state.quoteCurrencyKey === action.payload ? undefined : state.quoteCurrencyKey
		},
		swapCurrencies: (state) => {
			const temp = state.quoteCurrencyKey
			state.quoteCurrencyKey = state.baseCurrencyKey
			state.baseCurrencyKey = temp

			state.baseAmount = state.txProvider === 'synthetix' ? state.quoteAmount : ''
			state.quoteAmount = ''
		},
		setOpenModal: (state, action) => {
			state.openModal = action.payload
		},
		closeModal: (state) => {
			state.openModal = undefined
		},
		setApprovalStatus: (state, action) => {
			state.approvalStatus = action.payload
		},
		setAllowance: (state, action) => {
			state.allowance = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchTransactionFee.fulfilled, (state, action) => {
			state.transactionFee = action.payload.transactionFee
			state.feeCost = action.payload.feeCost
		})
		builder.addCase(submitExchange.pending, (state) => {
			state.isSubmitting = true
			state.openModal = 'confirm'
			state.txError = undefined
		})
		builder.addCase(submitExchange.fulfilled, (state) => {
			state.isSubmitting = false
			state.openModal = undefined
		})
		builder.addCase(submitExchange.rejected, (state, action) => {
			state.isSubmitting = false
			state.openModal = undefined
			state.txError = action.error.message
		})
		builder.addCase(submitApprove.pending, (state) => {
			state.approvalStatus = FetchStatus.Loading
			state.openModal = 'approve'
			state.txError = undefined
		})
		builder.addCase(submitApprove.fulfilled, (state) => {
			state.openModal = undefined
		})
		builder.addCase(submitApprove.rejected, (state, action) => {
			state.openModal = undefined
			state.approvalStatus = FetchStatus.Error
			state.txError = action.error.message
		})
		builder.addCase(submitSettle.pending, (state) => {
			state.openModal = 'settle'
			state.txError = undefined
		})
		builder.addCase(submitSettle.fulfilled, (state) => {
			state.openModal = undefined
		})
		builder.addCase(submitSettle.rejected, (state, action) => {
			state.openModal = undefined
			state.txError = action.error.message
		})
		builder.addCase(fetchTokenList.pending, (state) => {
			state.tokenListStatus = FetchStatus.Loading
		})
		builder.addCase(fetchTokenList.fulfilled, (state, action) => {
			state.tokenListStatus = FetchStatus.Success
			state.synthsMap = action.payload.synthsMap
			state.tokensMap = action.payload.tokensMap
			state.tokenList = action.payload.tokenList
			state.synthSuspensions = action.payload.synthSuspensions
		})
		builder.addCase(fetchTokenList.rejected, (state) => {
			state.tokenListStatus = FetchStatus.Error
		})
		builder.addCase(fetchFeeReclaimPeriod.fulfilled, (state, action) => {
			state.feeReclaimPeriod = action.payload.feeReclaimPeriod
			state.settlementWaitingPeriod = action.payload.settlementWaitingPeriod
		})
		builder.addCase(fetchNumEntries.fulfilled, (state, action) => {
			state.numEntries = action.payload
		})
		builder.addCase(updateBaseAmount.pending, (state) => {
			if (!!state.txProvider && state.txProvider !== 'synthetix') {
				state.oneInchQuoteLoading = true
			}
		})
		builder.addCase(updateBaseAmount.fulfilled, (state, action) => {
			state.oneInchQuoteLoading = false
			state.baseAmount = action.payload.baseAmount
			state.slippagePercent = action.payload.slippagePercent
		})
		builder.addCase(updateBaseAmount.rejected, (state) => {
			state.oneInchQuoteLoading = false
			state.oneInchQuoteError = true
		})
		builder.addCase(resetCurrencyKeys.fulfilled, (state, action) => {
			state.baseFeeRate = action.payload.baseFeeRate
			state.rate = action.payload.rate
			state.exchangeFeeRate = action.payload.exchangeFeeRate
			state.quotePriceRate = action.payload.quotePriceRate
			state.basePriceRate = action.payload.basePriceRate
			state.txProvider = action.payload.txProvider
			state.allowance = action.payload.allowance
			state.oneInchQuoteError = false
			state.approvalStatus = FetchStatus.Idle
			state.isSubmitting = false
		})
		builder.addCase(fetchWalletTrades.pending, (state) => {
			state.walletTradesStatus = FetchStatus.Loading
		})
		builder.addCase(fetchWalletTrades.fulfilled, (state, action) => {
			state.walletTradesStatus = FetchStatus.Success
			state.walletTrades = action.payload
		})
		builder.addCase(fetchWalletTrades.rejected, (state) => {
			state.walletTradesStatus = FetchStatus.Error
		})
	},
})

export const {
	setQuoteAmount,
	setBaseAmount,
	swapCurrencies,
	setQuoteCurrencyKey,
	setBaseCurrencyKey,
	setOpenModal,
	closeModal,
	setApprovalStatus,
} = exchangeSlice.actions

export default exchangeSlice.reducer
