import { createAsyncThunk } from '@reduxjs/toolkit';

import { Period } from 'sdk/constants/period';
import { FuturesMarketSerialized } from 'sdk/types/futures';
import { AppThunk } from 'state/store';
import { ThunkConfig } from 'state/types';
import { FuturesMarketAsset, serializeMarkets } from 'utils/futures';

import { FundingRateSerialized } from './types';

export const setMarketAsset = (asset: FuturesMarketAsset): AppThunk => (dispatch) => {
	dispatch({
		type: 'futures/setMarketAsset',
		payload: asset,
	});
};

export const fetchMarkets = createAsyncThunk<
	{ markets: FuturesMarketSerialized[]; fundingRates: FundingRateSerialized[] },
	void,
	ThunkConfig
>('futures/fetchMarkets', async (_, { extra: { sdk } }) => {
	const markets = await sdk.futures.getMarkets();
	const serializedMarkets = serializeMarkets(markets);
	const averageFundingRates = await sdk.futures.getAverageFundingRates(markets, Period.ONE_HOUR);
	const seriailizedRates = averageFundingRates.map((r) => ({
		...r,
		fundingRate: r.fundingRate ? r.fundingRate.toString() : null,
	}));
	return { markets: serializedMarkets, fundingRates: seriailizedRates };
});

// TODO: Finish
export const resetFuturesState = (): AppThunk => (dispatch) => {
	dispatch({
		type: 'futures/setMarketAsset',
	});
};
