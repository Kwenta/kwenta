import { toWei, truncateNumbers } from '@kwenta/sdk/utils'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'
import { ethers } from 'ethers'

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults'
import { monitorTransaction } from 'contexts/RelayerContext'
import { Rates } from 'queries/rates/types'
import { fetchBalances } from 'state/balances/actions'
import { AppThunk } from 'state/store'
import { FetchStatus, ThunkConfig } from 'state/types'

import {
	selectBaseBalanceWei,
	selectInsufficientBalance,
	selectIsApproved,
	selectQuoteBalanceWei,
} from './selectors'
import { SwapRatio } from './types'

export const fetchTransactionFee = createAsyncThunk<
	{ transactionFee?: string; feeCost?: string },
	void,
	ThunkConfig
>('exchange/fetchTransactionFee', async (_, { getState, extra: { sdk } }) => {
	const state = getState()

	const {
		exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
	} = state

	const isApproved = selectIsApproved(state)
	const insufficientBalance = selectInsufficientBalance(state)

	if (!isApproved || insufficientBalance) {
		return { transactionFee: '0', feeCost: '0' }
	}

	if (baseCurrencyKey && quoteCurrencyKey) {
		const [transactionFee, feeCost] = await Promise.all([
			sdk.exchange.getTransactionFee(quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount),
			sdk.exchange.getFeeCost(quoteCurrencyKey, baseCurrencyKey, quoteAmount),
		])

		return {
			transactionFee: transactionFee?.toString(),
			feeCost: feeCost.toString(),
		}
	}

	return { transactionFee: undefined, feeCost: undefined }
})

export const submitExchange = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitExchange',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
		} = getState()

		if (quoteCurrencyKey && baseCurrencyKey) {
			const hash = await sdk.exchange.handleExchange(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount,
				baseAmount
			)

			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						dispatch(fetchNumEntries())
						dispatch({ type: 'exchange/setQuoteAmount', payload: '' })
						dispatch({ type: 'exchange/setBaseAmount', payload: '' })
						dispatch(fetchBalances())
					},
				})
			}
		}
	}
)

export const submitApprove = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitApprove',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState()

		if (quoteCurrencyKey && baseCurrencyKey) {
			const hash = await sdk.exchange.approveSwap(quoteCurrencyKey, baseCurrencyKey)

			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						dispatch({ type: 'exchange/setApprovalStatus', payload: FetchStatus.Success })
						dispatch({
							type: 'exchange/setAllowance',
							payload: wei(ethers.utils.formatEther(ethers.constants.MaxUint256)).toString(),
						})
					},
					onTxFailed: () => {
						dispatch({ type: 'exchange/setApprovalStatus', payload: FetchStatus.Error })
					},
				})
			}
		}
	}
)

export const fetchTokenList = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchTokenList',
	async (_, { extra: { sdk } }) => {
		const synthsMap = sdk.exchange.getSynthsMap()
		const [{ tokensMap, tokenList }, synthSuspensions] = await Promise.all([
			sdk.exchange.getOneInchTokens(),
			sdk.exchange.getSynthSuspensions(),
		])

		return { synthsMap, tokensMap, tokenList, synthSuspensions }
	}
)

export const resetCurrencyKeys = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/resetCurrencyKeys',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
			wallet: { walletAddress },
		} = getState()

		let baseFeeRate = undefined
		let rate = undefined
		let exchangeFeeRate = undefined
		let quotePriceRate = undefined
		let basePriceRate = undefined
		let txProvider: ReturnType<typeof sdk.exchange.getTxProvider> = undefined
		let allowance = undefined

		if (walletAddress) {
			if (quoteCurrencyKey && baseCurrencyKey) {
				txProvider = sdk.exchange.getTxProvider(quoteCurrencyKey, baseCurrencyKey)

				// TODO: We should not have to do this.
				// But we need the coingecko prices to generate the rates.
				const coinGeckoPrices = await sdk.exchange.getCoingeckoPrices(
					quoteCurrencyKey,
					baseCurrencyKey
				)

				;[baseFeeRate, rate, exchangeFeeRate, quotePriceRate, basePriceRate] = await Promise.all([
					sdk.exchange.getBaseFeeRate(quoteCurrencyKey, baseCurrencyKey),
					sdk.exchange.getRate(quoteCurrencyKey, baseCurrencyKey),
					sdk.exchange.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
					sdk.exchange.getPriceRate(quoteCurrencyKey, txProvider, coinGeckoPrices),
					sdk.exchange.getPriceRate(baseCurrencyKey, txProvider, coinGeckoPrices),
				])

				if (txProvider === 'synthetix') {
					if (!!quoteAmount) {
						const baseAmountNoFee = wei(quoteAmount).mul(rate ?? 0)
						const fee = baseAmountNoFee.mul(exchangeFeeRate ?? 0)

						dispatch({
							type: 'exchange/setBaseAmountRaw',
							payload: truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS),
						})
					}

					if (!!baseAmount) {
						const inverseRate = wei(rate ?? 0).gt(0) ? wei(1).div(rate) : wei(0)
						const quoteAmountNoFee = wei(baseAmount).mul(inverseRate)
						const fee = quoteAmountNoFee.mul(exchangeFeeRate ?? 0)

						dispatch({
							type: 'exchange/setQuoteAmountRaw',
							payload: truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS),
						})
					}
				}

				allowance = await sdk.exchange.checkAllowance(quoteCurrencyKey, baseCurrencyKey)
			}
		}

		return {
			baseFeeRate: baseFeeRate?.toString(),
			rate: rate?.toString(),
			exchangeFeeRate: exchangeFeeRate?.toString(),
			quotePriceRate: quotePriceRate?.toString(),
			basePriceRate: basePriceRate?.toString(),
			txProvider,
			allowance: allowance?.toString(),
		}
	}
)

export const changeQuoteCurrencyKey = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/changeQuoteCurrencyKey',
	async (currencyKey, { dispatch }) => {
		dispatch({ type: 'exchange/setQuoteCurrencyKey', payload: currencyKey })
		dispatch(resetCurrencyKeys())
		dispatch(fetchFeeReclaimPeriod())
	}
)

export const changeBaseCurrencyKey = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/changeBaseCurrencyKey',
	async (currencyKey, { dispatch }) => {
		dispatch({ type: 'exchange/setBaseCurrencyKey', payload: currencyKey })
		dispatch(resetCurrencyKeys())
		dispatch(fetchFeeReclaimPeriod())
	}
)

export const resetCurrencies = createAsyncThunk<
	void,
	{
		quoteCurrencyFromQuery: string | undefined
		baseCurrencyFromQuery: string | undefined
	},
	ThunkConfig
>(
	'exchange/resetCurrencies',
	async ({ quoteCurrencyFromQuery, baseCurrencyFromQuery }, { dispatch, extra: { sdk } }) => {
		await dispatch(fetchTokenList())

		const [validQuoteCurrency, validBaseCurrency] = sdk.exchange.validCurrencyKeys(
			quoteCurrencyFromQuery,
			baseCurrencyFromQuery
		)

		const quoteCurrencyKey = validQuoteCurrency ? quoteCurrencyFromQuery : 'sUSD'
		const baseCurrencyKey = validBaseCurrency ? baseCurrencyFromQuery : undefined

		dispatch({ type: 'exchange/setQuoteCurrencyKey', payload: quoteCurrencyKey })
		dispatch({ type: 'exchange/setBaseCurrencyKey', payload: baseCurrencyKey })
		dispatch(resetCurrencyKeys())
		dispatch(fetchFeeReclaimPeriod())
	}
)

export const fetchFeeReclaimPeriod = createAsyncThunk<
	{
		feeReclaimPeriod: number
		settlementWaitingPeriod: number
	},
	void,
	ThunkConfig
>('exchange/fetchFeeReclaimPeriod', async (_, { getState, extra: { sdk } }) => {
	const {
		exchange: { quoteCurrencyKey, baseCurrencyKey },
	} = getState()
	const [feeReclaimPeriod, settlementWaitingPeriod] = await Promise.all([
		quoteCurrencyKey ? sdk.exchange.getFeeReclaimPeriod(quoteCurrencyKey) : 0,
		baseCurrencyKey ? sdk.exchange.getFeeReclaimPeriod(baseCurrencyKey) : 0,
	])

	return { feeReclaimPeriod, settlementWaitingPeriod }
})

export const submitSettle = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitSettle',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { baseCurrencyKey },
		} = getState()

		if (baseCurrencyKey) {
			const hash = await sdk.exchange.handleSettle(baseCurrencyKey)

			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						dispatch(fetchNumEntries())
					},
				})
			}
		}
	}
)

export const fetchNumEntries = createAsyncThunk<number, void, ThunkConfig>(
	'exchange/fetchNumEntries',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { baseCurrencyKey },
		} = getState()

		if (baseCurrencyKey) {
			return sdk.exchange.getNumEntries(baseCurrencyKey)
		}

		return 0
	}
)

export const setBaseAmount = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/setBaseAmount',
	async (value, { getState, dispatch }) => {
		const {
			exchange: { txProvider, quoteCurrencyKey, rate, exchangeFeeRate },
		} = getState()

		let baseAmount = ''
		let quoteAmount = ''

		if (value !== '') {
			baseAmount = value

			if (txProvider === 'synthetix' && !!quoteCurrencyKey) {
				const inverseRate = wei(rate || 0).gt(0) ? wei(1).div(rate) : wei(0)
				const quoteAmountNoFee = wei(value).mul(inverseRate)
				const fee = quoteAmountNoFee.mul(exchangeFeeRate ?? 0)
				quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
			}

			await dispatch(fetchTransactionFee())
		}

		return { baseAmount, quoteAmount }
	}
)

export const updateBaseAmount = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/updateBaseAmount',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: {
				txProvider,
				quoteCurrencyKey,
				baseCurrencyKey,
				rate,
				exchangeFeeRate,
				quoteAmount,
			},
		} = getState()

		let baseAmount = ''
		let slippagePercent = undefined

		if (quoteAmount !== '') {
			if (txProvider === 'synthetix' && baseCurrencyKey) {
				const baseAmountNoFee = wei(quoteAmount).mul(wei(rate ?? 0))
				const fee = baseAmountNoFee.mul(wei(exchangeFeeRate ?? 0))
				baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
			} else if (!!quoteCurrencyKey && !!baseCurrencyKey && !!quoteAmount && !!txProvider) {
				baseAmount = await sdk.exchange.getOneInchQuote(
					baseCurrencyKey,
					quoteCurrencyKey,
					quoteAmount
				)

				if (txProvider === '1inch') {
					const quoteAmountWei = toWei(quoteAmount)
					const baseAmountWei = toWei(baseAmount)

					slippagePercent = await sdk.exchange.getSlippagePercent(
						quoteCurrencyKey,
						baseCurrencyKey,
						quoteAmountWei,
						baseAmountWei
					)
				}
			}
		}

		await dispatch(fetchTransactionFee())
		return {
			baseAmount,
			slippagePercent: slippagePercent?.toString(),
		}
	}
)

export const setMaxQuoteBalance = (): AppThunk => (dispatch, getState) => {
	const state = getState()
	const quoteBalance = selectQuoteBalanceWei(state)

	const {
		exchange: { quoteCurrencyKey, txProvider, rate, exchangeFeeRate },
	} = state

	if (quoteBalance.gte(0)) {
		if (quoteCurrencyKey === 'ETH') {
			const ETH_TX_BUFFER = 0.006
			const balanceWithBuffer = quoteBalance.sub(wei(ETH_TX_BUFFER))
			dispatch({
				type: 'exchange/setQuoteAmountRaw',
				payload: balanceWithBuffer.lt(0)
					? '0'
					: truncateNumbers(balanceWithBuffer, DEFAULT_CRYPTO_DECIMALS),
			})
		} else {
			dispatch({
				type: 'exchange/setQuoteAmountRaw',
				payload: truncateNumbers(quoteBalance, DEFAULT_CRYPTO_DECIMALS),
			})
		}

		if (txProvider === 'synthetix') {
			const baseAmountNoFee = quoteBalance.mul(rate ?? 0)
			const fee = baseAmountNoFee.mul(wei(exchangeFeeRate ?? 0))
			dispatch({
				type: 'exchange/setBaseAmountRaw',
				payload: truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS),
			})
		}
	}
}

export const setMaxBaseBalance = (): AppThunk => (dispatch, getState) => {
	const state = getState()
	const baseBalance = selectBaseBalanceWei(state)

	const {
		exchange: { txProvider, rate, exchangeFeeRate },
	} = state

	if (baseBalance.gte(0)) {
		dispatch({
			type: 'exchange/setBaseAmountRaw',
			payload: truncateNumbers(baseBalance, DEFAULT_CRYPTO_DECIMALS),
		})

		if (!!txProvider) {
			const inverseRate = wei(rate || 0).gt(0) ? wei(1).div(rate) : wei(0)
			const baseAmountNoFee = wei(baseBalance).mul(inverseRate)
			const fee = baseAmountNoFee.mul(exchangeFeeRate ?? 0)

			dispatch({
				type: 'exchange/setQuoteAmountRaw',
				payload: truncateNumbers(baseAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS),
			})
		}
	}
}

export const setRatio =
	(value: SwapRatio): AppThunk =>
	(dispatch, getState) => {
		const state = getState()
		const quoteBalance = selectQuoteBalanceWei(state)

		const {
			exchange: { baseCurrencyKey, txProvider, rate, exchangeFeeRate },
		} = state

		const newQuote = truncateNumbers(quoteBalance.mul(value / 100), DEFAULT_CRYPTO_DECIMALS)

		dispatch({ type: 'exchange/setQuoteAmountRaw', payload: newQuote })

		if (txProvider === 'synthetix' && !!baseCurrencyKey) {
			const baseAmountNoFee = wei(newQuote).mul(rate ?? 0)
			const fee = baseAmountNoFee.mul(exchangeFeeRate ?? 0)
			dispatch({
				type: 'exchange/setBaseAmountRaw',
				payload: truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS),
			})
		}
	}

export const setExchangeRates =
	(exchangeRates: Rates): AppThunk =>
	(dispatch) => {
		dispatch({
			type: 'exchange/setExchangeRates',
			payload: Object.entries(exchangeRates).reduce((acc, [key, value]) => {
				acc[key] = value.toString()
				return acc
			}, {} as Record<string, string>),
		})
	}
