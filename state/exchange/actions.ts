import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSynthBalances } from 'state/balances/actions';
import type { ThunkConfig } from 'state/types';

import { monitorTransaction } from 'contexts/RelayerContext';
import { toWei } from 'utils/formatters/number';

export const fetchBalances = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchBalances',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		const [
			quoteBalance,
			baseBalance,
			{ balances: redeemableBalances, totalUSDBalance: totalRedeemableBalance },
		] = await Promise.all([
			quoteCurrencyKey ? sdk.exchange.getBalance(quoteCurrencyKey) : undefined,
			baseCurrencyKey ? sdk.exchange.getBalance(baseCurrencyKey) : undefined,
			sdk.exchange.getRedeemableDeprecatedSynths(),
		]);

		return {
			quoteBalance: quoteBalance ? quoteBalance.toString() : undefined,
			baseBalance: baseBalance ? baseBalance.toString() : undefined,
			redeemableSynthBalances: redeemableBalances.map((r) => ({
				...r,
				balance: '0',
				usdBalance: r.usdBalance.toString(),
			})),
			totalRedeemableBalance: totalRedeemableBalance.toString(),
		};
	}
);

export const fetchTxProvider = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchTxProvider',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (baseCurrencyKey && quoteCurrencyKey) {
			return sdk.exchange.getTxProvider(baseCurrencyKey, quoteCurrencyKey);
		}

		return undefined;
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
			transactionFee: transactionFee ? transactionFee.toString() : undefined,
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
						dispatch(fetchSynthBalances());
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
	async (_, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.exchange.handleRedeem();

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(fetchSynthBalances());
					dispatch(fetchBalances());
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

export const checkNeedsApproval = createAsyncThunk<
	'approved' | 'needs-approval' | undefined,
	void,
	ThunkConfig
>('exchange/checkNeedsApproval', async (_, { getState, extra: { sdk } }) => {
	const {
		exchange: { quoteCurrencyKey, baseCurrencyKey },
	} = getState();

	if (quoteCurrencyKey && baseCurrencyKey) {
		const needsApproval = sdk.exchange.checkNeedsApproval(baseCurrencyKey, quoteCurrencyKey);

		if (needsApproval) {
			// TODO: Handle case where allowance is not MaxUint256.
			// Simplest way to do this is to return the allowance from
			// checkAllowance, store it in state to do the comparison there.
			const isApproved = await sdk.exchange.checkAllowance(quoteCurrencyKey, baseCurrencyKey, '0');
			return isApproved ? 'approved' : 'needs-approval';
		} else {
			return 'approved';
		}
	}

	return undefined;
});

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
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		let baseFeeRate = undefined;
		let rate = undefined;
		let exchangeFeeRate = undefined;
		let quotePriceRate = undefined;
		let basePriceRate = undefined;
		let txProvider = undefined;
		let approvalStatus = undefined;

		if (quoteCurrencyKey && baseCurrencyKey) {
			[baseFeeRate, rate, exchangeFeeRate, quotePriceRate, basePriceRate] = await Promise.all([
				sdk.exchange.getBaseFeeRate(baseCurrencyKey, quoteCurrencyKey),
				sdk.exchange.getRate(baseCurrencyKey, quoteCurrencyKey),
				sdk.exchange.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
				sdk.exchange.getQuotePriceRate(baseCurrencyKey, quoteCurrencyKey),
				sdk.exchange.getBasePriceRate(baseCurrencyKey, quoteCurrencyKey),
			]);

			txProvider = sdk.exchange.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

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
		await dispatch(resetCurrencyKeys());
		// TODO: Handle other things that depend on "txProvider" here.
		// - feeReclaimPeriod
	}
);

export const changeBaseCurrencyKey = createAsyncThunk<any, string, ThunkConfig>(
	'exchange/changeBaseCurrencyKey',
	async (currencyKey, { dispatch }) => {
		dispatch({ type: 'exchange/setBaseCurrencyKey', payload: currencyKey });
		await dispatch(resetCurrencyKeys());
		// TODO: Handle other things that depend on "txProvider" here.
		// - settlementReclaimPeriod
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
		await sdk.exchange.getOneInchTokens();

		const validQuoteCurrency =
			!!quoteCurrencyFromQuery && sdk.exchange.validCurrencyKey(quoteCurrencyFromQuery);
		const validBaseCurrency =
			!!baseCurrencyFromQuery && sdk.exchange.validCurrencyKey(baseCurrencyFromQuery);

		dispatch({
			type: 'exchange/setQuoteCurrencyKey',
			payload: validQuoteCurrency ? quoteCurrencyFromQuery : 'sUSD',
		});

		dispatch({
			type: 'exchange/setBaseCurrencyKey',
			payload: validBaseCurrency ? baseCurrencyFromQuery : undefined,
		});

		dispatch(resetCurrencyKeys());
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
			const numEntries = await sdk.exchange.getNumEntries(baseCurrencyKey);
			return numEntries;
		}

		return 0;
	}
);

export const fetchOneInchQuote = createAsyncThunk<
	{
		oneInchQuote?: string;
		slippagePercent?: string;
	},
	void,
	ThunkConfig
>('exchange/fetchOneInchQuote', async (_, { getState, extra: { sdk } }) => {
	const {
		exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, txProvider },
	} = getState();

	let oneInchQuote = undefined;
	let slippagePercent = undefined;

	if (
		!!quoteCurrencyKey &&
		!!baseCurrencyKey &&
		!!quoteAmount &&
		!!txProvider &&
		txProvider !== 'synthetix'
	) {
		oneInchQuote = await sdk.exchange.getOneInchQuote(
			baseCurrencyKey,
			quoteCurrencyKey,
			quoteAmount
		);

		if (txProvider === '1inch') {
			const quoteAmountWei = toWei(quoteAmount);
			const baseAmountWei = toWei(oneInchQuote);

			slippagePercent = await sdk.exchange.getSlippagePercent(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmountWei,
				baseAmountWei
			);
		}
	}

	return { oneInchQuote, slippagePercent: slippagePercent?.toString() };
});
