import { PricesMap } from 'sdk/types/common';

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
};
