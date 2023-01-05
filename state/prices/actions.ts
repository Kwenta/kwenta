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

		priceColors[asset] = {
			color:
				!!newPrice && !!oldPrice
					? newPrice.gt(oldPrice)
						? 'green'
						: oldPrice.gt(newPrice)
						? 'red'
						: 'white'
					: 'white',
			expiresAt: Date.now() + 1000,
		};
	}

	if (type === 'off_chain') {
		dispatch(setOffChainPriceColors(priceColors));
	} else {
		dispatch(setOnChainPriceColors(priceColors));
	}
};
