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
			? await sdk.exchange.getBalance(quoteCurrencyKey, '')
			: undefined;

		const baseBalance = baseCurrencyKey
			? await sdk.exchange.getBalance(baseCurrencyKey, '')
			: undefined;

		return { quoteBalance, baseBalance };
	}
);
