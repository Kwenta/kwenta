import { createAsyncThunk } from '@reduxjs/toolkit';

import { monitorTransaction } from 'contexts/RelayerContext';
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

	const averageFundingRates = await sdk.futures.getAverageFundingRates(markets);
	const serializedRates = averageFundingRates.map((r) => ({
		...r,
		fundingRate: r.fundingRate ? r.fundingRate.toString() : null,
	}));
	return { markets: serializedMarkets, fundingRates: serializedRates };
});

export const transferIsolatedMargin = createAsyncThunk<any, void, ThunkConfig>(
	'futures/transferIsolatedMargin',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const { futures } = getState();

		const marketAddress =
			futures.markets.find(({ asset }) => (asset = futures.isolatedMargin.marketAsset))?.market ??
			'';
		const transferAmount = futures.isolatedMargin.transferAmount;

		const hash = await sdk.futures.transferIsolatedMargin(marketAddress, transferAmount);

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					// dispatch(getEarnDetails());
				},
			});
		}
	}
);

// TODO: Finish
export const resetFuturesState = (): AppThunk => (dispatch) => {
	dispatch({
		type: 'futures/resetFuturesState',
	});
};
