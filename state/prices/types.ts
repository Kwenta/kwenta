import Wei from '@synthetixio/wei';

import { SynthPrice, AssetKey } from 'sdk/types/prices';
import { QueryStatus } from 'state/types';

export type PriceChange = 'up' | 'down' | null;
export type PriceColorOptions = 'red' | 'green' | 'white';

type PricesInfo<T = Wei> = {
	price: T;
	change: PriceChange;
};

export type PriceColor = {
	offChain?: PriceColorOptions;
	onChain?: PriceColorOptions;
};

export type PriceColors = Record<string, PriceColor>;

export type PricesInfoMap = Partial<Record<AssetKey, PricesInfo<string>>>;

export type PricesQueryStatuses = {
	previousDayPrices: QueryStatus;
};

export type PricesState = {
	onChainPrices: PricesInfoMap;
	offChainPrices: PricesInfoMap;
	connectionError: string | null | undefined;
	previousDayPrices: SynthPrice[];
	queryStatuses: PricesQueryStatuses;
};
