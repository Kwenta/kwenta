import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { Prices } from 'sdk/types/prices';
import { RootState } from 'state/store';
import { getPricesForCurrencies } from 'utils/currencies';

import { PriceColors } from './types';

export const selectPrices = createSelector(
	(state: RootState) => state.prices,
	({ onChainPrices, offChainPrices }) => {
		const merged: Prices = {};
		Object.entries(onChainPrices).forEach(([key, value]) => {
			merged[key] = {
				onChain: wei(value),
			};
		});
		Object.entries(offChainPrices).forEach(([key, value]) => {
			if (merged[key]) {
				merged[key].offChain = wei(value);
			} else {
				merged[key] = {
					offChain: wei(value),
				};
			}
		});
		return merged;
	}
);

export const selectPriceColors = createSelector(
	(state: RootState) => state.prices,
	({ onChainPriceColors, offChainPriceColors }) => {
		const merged: PriceColors = {};
		Object.entries(onChainPriceColors).forEach(([key, value]) => {
			merged[key] = {
				onChain: value,
			};
		});
		Object.entries(offChainPriceColors).forEach(([key, value]) => {
			if (merged[key]) {
				merged[key].offChain = value;
			} else {
				merged[key] = {
					offChain: value,
				};
			}
		});
		return merged;
	}
);
export const selectPreviousDayPrices = (state: RootState) => state.prices.previousDayPrices;

export const selectLatestEthPrice = createSelector(selectPrices, (prices) => {
	const price = getPricesForCurrencies(prices, 'sETH', 'sUSD');
	return price.offChain ?? price.onChain ?? wei(0);
});

export const selectPricesConnectionError = (state: RootState) => state.prices.connectionError;
