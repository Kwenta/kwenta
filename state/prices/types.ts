import { AssetKey, PricesMap } from 'sdk/types/prices';

type PriceColor = 'white' | 'red' | 'green';
type PriceColorInfo = {
	color: PriceColor;
	expiresAt: number;
};

export type PriceColorMap = Partial<Record<AssetKey, PriceColorInfo>>;
export type PriceColors = Record<string, { onChain?: PriceColorInfo; offChain?: PriceColorInfo }>;

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
	onChainPriceColors: PriceColorMap;
	offChainPriceColors: PriceColorMap;
	connectionError: string | null | undefined;
};
