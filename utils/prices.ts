import { PricesMap } from 'sdk/types/prices';
import { PriceColorMap } from 'state/prices/types';

export const resetExpiredPriceColors = (priceColors: PriceColorMap): PriceColorMap => {
	let newPriceColors: PriceColorMap = {};
	let asset: keyof PricesMap;
	for (asset in priceColors) {
		const priceColor = priceColors[asset];
		if (priceColor) {
			newPriceColors[asset] = {
				color: priceColor.expiresAt < Date.now() ? 'white' : priceColor.color,
				expiresAt: priceColor.expiresAt,
			};
		}
	}
	return newPriceColors;
};
