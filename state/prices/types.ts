import { AssetKey, PricesMap } from 'sdk/types/prices';

type PriceColor = 'white' | 'red' | 'green';
export type PriceColorMap = Partial<Record<AssetKey, PriceColor>>;

export type PriceColors = Record<string, { onChain?: PriceColor; offChain?: PriceColor }>;

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
	onChainPriceColors: PriceColorMap;
	offChainPriceColors: PriceColorMap;
	connectionError: string | null | undefined;
};
