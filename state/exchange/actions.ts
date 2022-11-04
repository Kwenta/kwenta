import { createAsyncThunk } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';
import { fetchSynthBalances } from 'state/balances/actions';
import type { ThunkConfig } from 'state/types';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { monitorTransaction } from 'contexts/RelayerContext';
import { toWei, truncateNumbers } from 'utils/formatters/number';

export const fetchRedeemableBalances = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchRedeemableBalances',
	async (_, { extra: { sdk } }) => {
		const {
			balances: redeemableBalances,
			totalUSDBalance: totalRedeemableBalance,
		} = await sdk.exchange.getRedeemableDeprecatedSynths();

		return {
			redeemableSynthBalances: redeemableBalances.map((r) => ({
				...r,
				balance: '0',
				usdBalance: r.usdBalance.toString(),
			})),
			totalRedeemableBalance: totalRedeemableBalance.toString(),
		};
	}
);

export const fetchTransactionFee = createAsyncThunk<
	{
		transactionFee?: string;
		feeCost?: string;
	},
	void,
	ThunkConfig
>('exchange/fetchTransactionFee', async (_, { getState, extra: { sdk } }) => {
	const {
		exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
	} = getState();

	if (baseCurrencyKey && quoteCurrencyKey) {
		const [transactionFee, feeCost] = await Promise.all([
			sdk.exchange.getTransactionFee(quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount),
			sdk.exchange.getFeeCost(quoteCurrencyKey, baseCurrencyKey, quoteAmount),
		]);

		return {
			transactionFee: transactionFee?.toString(),
			feeCost: feeCost.toString(),
		};
	}

	return { transactionFee: undefined, feeCost: undefined };
});

export const submitExchange = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitExchange',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
			wallet: { walletAddress },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
			const hash = await sdk.exchange.handleExchange(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount,
				baseAmount
			);

			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						if (walletAddress) dispatch(fetchSynthBalances(walletAddress));
						dispatch(fetchNumEntries());
						dispatch({
							type: 'exchange/setQuoteAmount',
							payload: { value: '' },
						});
						dispatch({
							type: 'exchange/setBaseAmount',
							payload: { value: '' },
						});
					},
				});
			}
		}
	}
);

export const submitRedeem = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitRedeem',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			wallet: { walletAddress },
		} = getState();
		const hash = await sdk.exchange.handleRedeem();

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					if (walletAddress) dispatch(fetchSynthBalances(walletAddress));
					dispatch(fetchRedeemableBalances());
				},
			});
		}
	}
);

export const submitApprove = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitApprove',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
			const hash = await sdk.exchange.approveSwap(quoteCurrencyKey, baseCurrencyKey);

			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						dispatch({ type: 'exchange/setApprovalStatus', payload: 'approved' });
					},
					onTxFailed: () => {
						dispatch({ type: 'exchange/setApprovalStatus', payload: 'needs-approval' });
					},
				});
			}
		}
	}
);

export const fetchTokenList = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchTokenList',
	async (_, { extra: { sdk } }) => {
		const synthsMap = sdk.exchange.getSynthsMap();
		const { tokensMap, tokenList } = await sdk.exchange.getOneInchTokens();

		return { synthsMap, tokensMap, tokenList };
	}
);

export const resetCurrencyKeys = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/resetCurrencyKeys',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
			wallet: { walletAddress },
		} = getState();

		let baseFeeRate = undefined;
		let rate = undefined;
		let exchangeFeeRate = undefined;
		let quotePriceRate = undefined;
		let basePriceRate = undefined;
		let txProvider = undefined;
		let approvalStatus = undefined;

		if (walletAddress) {
			const quoteBalance = !!quoteCurrencyKey
				? await sdk.exchange.getBalance(quoteCurrencyKey)
				: undefined;

			const baseBalance = !!baseCurrencyKey
				? await sdk.exchange.getBalance(baseCurrencyKey)
				: undefined;

			dispatch({
				type: 'exchange/setBalances',
				payload: { quoteBalance: quoteBalance?.toString(), baseBalance: baseBalance?.toString() },
			});

			if (quoteCurrencyKey && baseCurrencyKey) {
				[baseFeeRate, rate, exchangeFeeRate, quotePriceRate, basePriceRate] = await Promise.all([
					sdk.exchange.getBaseFeeRate(baseCurrencyKey, quoteCurrencyKey),
					sdk.exchange.getRate(baseCurrencyKey, quoteCurrencyKey),
					sdk.exchange.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
					sdk.exchange.getQuotePriceRate(baseCurrencyKey, quoteCurrencyKey),
					sdk.exchange.getBasePriceRate(baseCurrencyKey, quoteCurrencyKey),
				]);

				txProvider = sdk.exchange.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

				if (txProvider === 'synthetix') {
					if (!!quoteCurrencyKey && !!quoteAmount && !!baseCurrencyKey) {
						const baseAmountNoFee = wei(quoteAmount).mul(rate ?? 0);
						const fee = baseAmountNoFee.mul(exchangeFeeRate ?? 0);

						dispatch({
							type: 'exchange/setBaseAmountRaw',
							payload: truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS),
						});
					}

					if (!!baseCurrencyKey && !!baseAmount && !!quoteCurrencyKey) {
						const inverseRate = wei(rate ?? 0).gt(0) ? wei(1).div(rate) : wei(0);
						const quoteAmountNoFee = wei(baseAmount).mul(inverseRate);
						const fee = quoteAmountNoFee.mul(exchangeFeeRate ?? 0);

						dispatch({
							type: 'exchange/setQuoteAmountRaw',
							payload: truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS),
						});
					}
				}

				const needsApproval = sdk.exchange.checkNeedsApproval(baseCurrencyKey, quoteCurrencyKey);

				if (needsApproval) {
					// TODO: Handle case where allowance is not MaxUint256.
					// Simplest way to do this is to return the allowance from
					// checkAllowance, store it in state to do the comparison there.
					const isApproved = await sdk.exchange.checkAllowance(
						quoteCurrencyKey,
						baseCurrencyKey,
						'0'
					);

					approvalStatus = isApproved ? 'approved' : 'needs-approval';
				} else {
					approvalStatus = 'approved';
				}
			}
		}

		return {
			baseFeeRate: baseFeeRate?.toString(),
			rate: rate?.toString(),
			exchangeFeeRate: exchangeFeeRate?.toString(),
			quotePriceRate: quotePriceRate?.toString(),
			basePriceRate: basePriceRate?.toString(),
			txProvider,
			approvalStatus,
		};
	}
);

export const changeQuoteCurrencyKey = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/changeQuoteCurrencyKey',
	async (currencyKey, { dispatch }) => {
		dispatch({ type: 'exchange/setQuoteCurrencyKey', payload: currencyKey });
		dispatch(resetCurrencyKeys());
		dispatch(fetchFeeReclaimPeriod());
	}
);

export const changeBaseCurrencyKey = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/changeBaseCurrencyKey',
	async (currencyKey, { dispatch }) => {
		dispatch({ type: 'exchange/setBaseCurrencyKey', payload: currencyKey });
		dispatch(resetCurrencyKeys());
		dispatch(fetchFeeReclaimPeriod());
	}
);

export const resetCurrencies = createAsyncThunk<
	void,
	{
		quoteCurrencyFromQuery: string | undefined;
		baseCurrencyFromQuery: string | undefined;
	},
	ThunkConfig
>(
	'exchange/resetCurrencies',
	async ({ quoteCurrencyFromQuery, baseCurrencyFromQuery }, { dispatch, extra: { sdk } }) => {
		await dispatch(fetchTokenList());

		const [validQuoteCurrency, validBaseCurrency] = sdk.exchange.validCurrencyKeys(
			quoteCurrencyFromQuery,
			baseCurrencyFromQuery
		);

		const quoteCurrencyKey = validQuoteCurrency ? quoteCurrencyFromQuery : 'sUSD';
		const baseCurrencyKey = validBaseCurrency ? baseCurrencyFromQuery : undefined;

		dispatch({ type: 'exchange/setQuoteCurrencyKey', payload: quoteCurrencyKey });
		dispatch({ type: 'exchange/setBaseCurrencyKey', payload: baseCurrencyKey });
		dispatch(resetCurrencyKeys());
		dispatch(fetchFeeReclaimPeriod());
	}
);

export const fetchFeeReclaimPeriod = createAsyncThunk<
	{
		feeReclaimPeriod: number;
		settlementWaitingPeriod: number;
	},
	void,
	ThunkConfig
>('exchange/fetchFeeReclaimPeriod', async (_, { getState, extra: { sdk } }) => {
	const {
		exchange: { quoteCurrencyKey, baseCurrencyKey },
	} = getState();
	const [feeReclaimPeriod, settlementWaitingPeriod] = await Promise.all([
		quoteCurrencyKey ? sdk.exchange.getFeeReclaimPeriod(quoteCurrencyKey) : 0,
		baseCurrencyKey ? sdk.exchange.getFeeReclaimPeriod(baseCurrencyKey) : 0,
	]);

	return { feeReclaimPeriod, settlementWaitingPeriod };
});

export const submitSettle = createAsyncThunk<void, void, ThunkConfig>(
	'exchange/submitSettle',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const {
			exchange: { baseCurrencyKey },
		} = getState();

		if (baseCurrencyKey) {
			const hash = await sdk.exchange.handleSettle(baseCurrencyKey);

			if (hash) {
				monitorTransaction({
					txHash: hash,
					onTxConfirmed: () => {
						dispatch(fetchNumEntries());
					},
				});
			}
		}
	}
);

export const fetchNumEntries = createAsyncThunk<number, void, ThunkConfig>(
	'exchange/fetchNumEntries',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { baseCurrencyKey },
		} = getState();

		if (baseCurrencyKey) {
			return sdk.exchange.getNumEntries(baseCurrencyKey);
		}

		return 0;
	}
);

export const setBaseAmount = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/setBaseAmount',
	async (value, { getState, dispatch }) => {
		const {
			exchange: { txProvider, quoteCurrencyKey, rate, exchangeFeeRate },
		} = getState();

		let baseAmount = '';
		let quoteAmount = '';

		if (value !== '') {
			baseAmount = value;

			if (txProvider === 'synthetix' && !!quoteCurrencyKey) {
				const inverseRate = wei(rate || 0).gt(0) ? wei(1).div(rate) : wei(0);
				const quoteAmountNoFee = wei(value).mul(inverseRate);
				const fee = quoteAmountNoFee.mul(exchangeFeeRate ?? 0);
				quoteAmount = truncateNumbers(quoteAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			}

			await dispatch(fetchTransactionFee());
		}

		return { baseAmount, quoteAmount };
	}
);

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
		} = getState();

		let baseAmount = '';
		let slippagePercent = undefined;

		if (quoteAmount !== '') {
			if (txProvider === 'synthetix' && baseCurrencyKey) {
				const baseAmountNoFee = wei(quoteAmount).mul(wei(rate ?? 0));
				const fee = baseAmountNoFee.mul(wei(exchangeFeeRate ?? 0));
				baseAmount = truncateNumbers(baseAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS);
			} else if (!!quoteCurrencyKey && !!baseCurrencyKey && !!quoteAmount && !!txProvider) {
				baseAmount = await sdk.exchange.getOneInchQuote(
					baseCurrencyKey,
					quoteCurrencyKey,
					quoteAmount
				);

				if (txProvider === '1inch') {
					const quoteAmountWei = toWei(quoteAmount);
					const baseAmountWei = toWei(baseAmount);

					slippagePercent = await sdk.exchange.getSlippagePercent(
						quoteCurrencyKey,
						baseCurrencyKey,
						quoteAmountWei,
						baseAmountWei
					);
				}
			}
		}

		await dispatch(fetchTransactionFee());

		return {
			baseAmount,
			slippagePercent: slippagePercent?.toString(),
		};
	}
);
