import { createSelector } from '@reduxjs/toolkit';

import { selectExchangeRatesWei } from 'state/exchange/selectors';
import { RootState } from 'state/store';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { MarketKeyByAsset, unserializeFundingRates, unserializeMarkets } from 'utils/futures';

import { FundingRate } from './types';

export const selectMarketKey = createSelector(
	(state: RootState) =>
		state.futures.futuresAccountType === 'cross_margin'
			? state.futures.crossMargin.marketAsset
			: state.futures.isolatedMargin.marketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);

export const selectMarketAsset = (state: RootState) => {
	return state.futures.futuresAccountType === 'cross_margin'
		? state.futures.crossMargin.marketAsset
		: state.futures.isolatedMargin.marketAsset;
};

export const selectMarketRate = createSelector(
	selectMarketKey,
	selectExchangeRatesWei,
	(marketKey, exchangeRates) => newGetExchangeRatesForCurrencies(exchangeRates, marketKey, 'sUSD')
);

export const selectMarkets = (state: RootState) => unserializeMarkets(state.futures.markets);

export const selectMarketsQueryStatus = (state: RootState) => state.futures.marketsQueryStatus;

export const selectMarketKeys = (state: RootState) =>
	state.futures.markets.map(({ asset }) => {
		return MarketKeyByAsset[asset];
	});

export const selectMarketAssets = (state: RootState) =>
	state.futures.markets.map(({ asset }) => asset);

export const selectAverageFundingRates = (state: RootState) =>
	unserializeFundingRates(state.futures.fundingRates);

export const selectFundingRate = createSelector(
	selectMarketKey,
	selectAverageFundingRates,
	(marketKey, fundingRates) => {
		return fundingRates.find((fundingRate: FundingRate) => fundingRate.asset === marketKey);
	}
);

export const selectMarketInfo = createSelector(
	selectMarkets,
	selectMarketAsset,
	(markets, selectedMarket) => {
		return markets.find((market) => market.asset === selectedMarket);
	}
);
