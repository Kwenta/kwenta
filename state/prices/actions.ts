import { wei } from '@synthetixio/wei';

import { PricesMap, PriceType } from 'sdk/types/prices';
import { AppThunk } from 'state/store';

import {
	setOffChainPriceColors,
	setOffChainPrices,
	setOnChainPriceColors,
	setOnChainPrices,
} from './reducer';
import { PriceColorMap } from './types';

export const updatePrices = (newPrices: PricesMap<string>, type: PriceType): AppThunk => (
	dispatch,
	getState
) => {
	const { prices } = getState();
	if (type === 'off_chain') {
		dispatch(setOffChainPrices(newPrices));
		dispatch(getPriceColors(prices.offChainPrices, newPrices, type));
	} else {
		dispatch(setOnChainPrices(newPrices));
		dispatch(getPriceColors(prices.onChainPrices, newPrices, type));
	}
};

const getPriceColors = (
	oldPrices: PricesMap<string>,
	newPrices: PricesMap<string>,
	type: PriceType
): AppThunk => (dispatch) => {
	let priceColors: PriceColorMap = {};

	let asset: keyof PricesMap;
	for (asset in newPrices) {
		const newPrice = wei(newPrices[asset]);
		const oldPrice = wei(oldPrices[asset]);

		priceColors[asset] =
			!!newPrice && !!oldPrice
				? newPrice.gt(oldPrice)
					? 'green'
					: oldPrice.gt(newPrice)
					? 'red'
					: 'white'
				: 'white';
	}

	if (type === 'off_chain') {
		dispatch(setOffChainPriceColors(priceColors));
		setTimeout(() => {
			dispatch(resetPriceColors(type));
		}, 1000);
	} else {
		dispatch(setOnChainPriceColors(priceColors));
		setTimeout(() => {
			dispatch(resetPriceColors(type));
		}, 1000);
	}
};

const resetPriceColors = (type: PriceType): AppThunk => (dispatch, getState) => {
	const { prices } = getState();
	const priceColors = type === 'off_chain' ? prices.offChainPriceColors : prices.onChainPriceColors;

	let newPriceColors: PriceColorMap = {};
	let asset: keyof PricesMap;
	for (asset in priceColors) {
		newPriceColors[asset] = 'white';
	}

	if (type === 'off_chain') {
		dispatch(setOffChainPriceColors(newPriceColors));
	} else {
		dispatch(setOnChainPriceColors(newPriceColors));
	}
};
