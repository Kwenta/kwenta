import { createAsyncThunk } from '@reduxjs/toolkit';
import KwentaSDK from 'sdk';
import { fetchSynthBalances } from 'state/balances/actions';
import type { AppDispatch, RootState } from 'state/store';

import { monitorTransaction } from 'contexts/RelayerContext';
import { toWei } from 'utils/formatters/number';

type ThunkConfig = {
	dispatch: AppDispatch;
	state: RootState;
	extra: { sdk: KwentaSDK };
};

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
			const txProvider = sdk.exchange.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

			return txProvider;
		}

		return undefined;
	}
);

export const fetchTransactionFee = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchTransactionFee',
	async (_, { getState, extra: { sdk } }) => {
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
	}
);

export const submitExchange = createAsyncThunk<any, void, ThunkConfig>(
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
				baseAmount,
				true
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

export const submitRedeem = createAsyncThunk<any, void, ThunkConfig>(
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

export const submitApprove = createAsyncThunk<any, void, ThunkConfig>(
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

export const checkNeedsApproval = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/checkNeedsApproval',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
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

				return isApproved ? 'approved' : 'needs-approval';
			} else {
				return 'approved';
			}
		}

		return undefined;
	}
);

export const fetchRates = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchRates',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (baseCurrencyKey && quoteCurrencyKey) {
			const [
				baseFeeRate,
				rate,
				exchangeFeeRate,
				quotePriceRate,
				basePriceRate,
			] = await Promise.all([
				sdk.exchange.getBaseFeeRate(baseCurrencyKey, quoteCurrencyKey),
				sdk.exchange.getRate(baseCurrencyKey, quoteCurrencyKey),
				sdk.exchange.getExchangeFeeRate(quoteCurrencyKey, baseCurrencyKey),
				sdk.exchange.getQuotePriceRate(baseCurrencyKey, quoteCurrencyKey),
				sdk.exchange.getBasePriceRate(baseCurrencyKey, quoteCurrencyKey),
			]);

			return {
				baseFeeRate: baseFeeRate.toString(),
				rate: rate.toString(),
				exchangeFeeRate: exchangeFeeRate.toString(),
				quotePriceRate: quotePriceRate.toString(),
				basePriceRate: basePriceRate.toString(),
			};
		} else {
			return {
				baseFeeRate: undefined,
				rate: undefined,
				exchangeFeeRate: undefined,
				quotePriceRate: undefined,
				basePriceRate: undefined,
			};
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

export const resetCurrencies = createAsyncThunk<
	{
		quoteCurrencyKey: string | undefined;
		baseCurrencyKey: string | undefined;
	},
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

		// Make sure the quote/base are set first!
		await Promise.all([
			dispatch(checkNeedsApproval()),
			dispatch(fetchTxProvider()),
			dispatch(fetchRates()),
		]);

		return {
			quoteCurrencyKey: validQuoteCurrency ? quoteCurrencyFromQuery : 'sUSD',
			baseCurrencyKey: validBaseCurrency ? baseCurrencyFromQuery : undefined,
		};
	}
);

export const fetchFeeReclaimPeriod = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchFeeReclaimPeriod',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		const [feeReclaimPeriod, settlementWaitingPeriod] = await Promise.all([
			quoteCurrencyKey ? sdk.exchange.getFeeReclaimPeriod(quoteCurrencyKey) : 0,
			baseCurrencyKey ? sdk.exchange.getFeeReclaimPeriod(baseCurrencyKey) : 0,
		]);

		return { feeReclaimPeriod, settlementWaitingPeriod };
	}
);

export const submitSettle = createAsyncThunk<any, void, ThunkConfig>(
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

export const fetchNumEntries = createAsyncThunk<any, void, ThunkConfig>(
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

export const fetchOneInchQuote = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchOneInchQuote',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, txProvider },
		} = getState();

		if (
			!!quoteCurrencyKey &&
			!!baseCurrencyKey &&
			!!quoteAmount &&
			!!txProvider &&
			txProvider !== 'synthetix'
		) {
			const oneInchQuote = await sdk.exchange.getOneInchQuote(
				baseCurrencyKey,
				quoteCurrencyKey,
				quoteAmount
			);

			return oneInchQuote;
		}

		return undefined;
	}
);

export const fetchSlippagePercent = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchSlippagePercent',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount, txProvider },
		} = getState();

		if (
			!!quoteCurrencyKey &&
			!!baseCurrencyKey &&
			txProvider === '1inch' &&
			!!quoteAmount &&
			!!baseAmount
		) {
			const quoteAmountWei = toWei(quoteAmount);
			const baseAmountWei = toWei(baseAmount);

			const slippagePercent = await sdk.exchange.getSlippagePercent(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmountWei,
				baseAmountWei
			);

			return slippagePercent;
		}

		return undefined;
	}
);
