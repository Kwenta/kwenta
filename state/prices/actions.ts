import { createAsyncThunk } from '@reduxjs/toolkit';

import { notifyError } from 'components/ErrorView/ErrorNotifier';
import { LatestRate, PricesMap, PriceType } from 'sdk/types/prices';
import { selectPrices } from 'state/prices/selectors';
import { AppThunk } from 'state/store';
import { ThunkConfig } from 'state/types';

import { setOffChainPrices, setOnChainPrices } from './reducer';

export const updatePrices = (prices: PricesMap<string>, type: PriceType): AppThunk => (
	dispatch
) => {
	if (type === 'off_chain') {
		dispatch(setOffChainPrices(prices));
	} else {
		dispatch(setOnChainPrices(prices));
	}
};

export const fetchPreviousDayRates = createAsyncThunk<
	LatestRate[],
	boolean | undefined,
	ThunkConfig
>('prices/fetchPreviousDayRates', async (mainnet, { getState, extra: { sdk } }) => {
	try {
		const prices = selectPrices(getState());
		const marketAssets = Object.keys(prices);

		const laggedPrices = await sdk.prices.getPreviousDayRates(
			marketAssets,
			mainnet ? 10 : undefined
		);

		return laggedPrices;
	} catch (err) {
		notifyError('Failed to fetch historical rates', err);
		throw err;
	}
});
