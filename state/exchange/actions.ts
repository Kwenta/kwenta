import { createAsyncThunk } from '@reduxjs/toolkit';
import KwentaSDK from 'sdk';
import { AppDispatch, RootState } from 'state/store';

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

		const quoteBalance = quoteCurrencyKey
			? await sdk.exchange.getBalance(quoteCurrencyKey)
			: undefined;

		const baseBalance = baseCurrencyKey
			? await sdk.exchange.getBalance(baseCurrencyKey)
			: undefined;

		return { quoteBalance, baseBalance };
	}
);

// TODO: Do this in a non-async way
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
			const transactionFee = await sdk.exchange.getTransactionFee(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount,
				baseAmount
			);

			return transactionFee;
		}

		return undefined;
	}
);

export const submitExchange = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/submitExchange',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
			await sdk.exchange.handleExchange(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount,
				baseAmount,
				true
			);
		}
	}
);

export const submitRedeem = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/submitRedeem',
	async (_, { extra: { sdk } }) => {
		await sdk.exchange.handleRedeem();
	}
);
