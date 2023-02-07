import { wei } from '@synthetixio/wei';

import { PricesMap } from 'sdk/types/prices';
import { PricesInfoMap, PricesInfoMapWei } from 'state/prices/types';

import { zeroBN } from './formatters/number';

export const getPricesInfo = (oldPrices: PricesInfoMap, newPrices: PricesMap<string>) => {
	let pricesInfo: PricesInfoMap = {};

	let asset: keyof PricesMap<string>;
	for (asset in newPrices) {
		const newPrice = wei(newPrices[asset]);
		const oldPrice = oldPrices[asset]?.price ? wei(oldPrices[asset]!.price) : null;
		const oldChange = oldPrices[asset]?.change;

		pricesInfo[asset] = {
			price: newPrice.toString(),
			change: !!oldPrice
				? newPrice.gt(oldPrice)
					? 'up'
					: oldPrice.gt(newPrice)
					? 'down'
					: oldChange ?? null
				: null,
		};
	}
	return pricesInfo;
};

export const deserializePricesInfo = (pricesInfo: PricesInfoMap) => {
	let newPricesInfo: PricesInfoMapWei = {};
	let asset: keyof PricesMap<string>;
	for (asset in pricesInfo) {
		newPricesInfo[asset] = {
			price: wei(pricesInfo[asset]?.price ?? zeroBN),
			change: pricesInfo[asset]?.change ?? null,
		};
	}
	return newPricesInfo;
};
