import { PricesMap } from 'sdk/types/prices';

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
	connectionError: string | null | undefined;
};
