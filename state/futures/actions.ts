import { createAsyncThunk } from '@reduxjs/toolkit';

import { monitorTransaction } from 'contexts/RelayerContext';
import { FuturesMarketSerialized, FuturesPositionSerialized } from 'sdk/types/futures';
import { accountType } from 'state/helpers';
import { AppThunk } from 'state/store';
import { ThunkConfig } from 'state/types';
import {
	FuturesMarketAsset,
	serializeMarkets,
	serializePosition,
	unserializeMarket,
} from 'utils/futures';

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

export const fetchPosition = createAsyncThunk<FuturesPositionSerialized, void, ThunkConfig>(
	'futures/fetchPosition',
	async (_, { getState, extra: { sdk } }) => {
		const { futures } = getState();
		const market = futures.markets.find(
			({ marketKey }) => marketKey === futures[accountType(futures.selectedType)].marketKey
		);
		if (!market) {
			throw Error; // TODO: Improve error
		}
		const unserializedMarket = unserializeMarket(market);

		const position = await sdk.futures.getPosition(unserializedMarket);
		const serializedPosition = serializePosition(position);
		return serializedPosition;
	}
);

export const transferIsolatedMargin = createAsyncThunk<any, void, ThunkConfig>(
	'futures/transferIsolatedMargin',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const { futures } = getState();

		const market = futures.markets.find(
			({ marketKey }) => marketKey === futures.isolatedMargin.marketKey
		);
		const transferAmount = futures.isolatedMargin.transferAmount;
		if (!market) {
			throw Error;
		}

		const hash = await sdk.futures.transferIsolatedMargin(market.market, transferAmount);

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(fetchPosition());
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
