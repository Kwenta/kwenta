import { SynthPrice, PricesMap, AssetKey } from 'sdk/types/prices';
import { QueryStatus } from 'state/types';

type PriceColor = 'white' | 'red' | 'green';
type PriceColorInfo = {
	color: PriceColor;
	expiresAt: number;
};

export type PriceColorMap = Partial<Record<AssetKey, PriceColorInfo>>;
export type PriceColors = Record<string, { onChain?: PriceColorInfo; offChain?: PriceColorInfo }>;

export type PricesQueryStatuses = {
	previousDayPrices: QueryStatus;
};

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
	onChainPriceColors: PriceColorMap;
	offChainPriceColors: PriceColorMap;
	connectionError: string | null | undefined;
	previousDayPrices: SynthPrice[];
	queryStatuses: PricesQueryStatuses;
};
