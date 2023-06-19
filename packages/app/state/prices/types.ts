import { SynthPrice, AssetKey } from '@kwenta/sdk/types';
import Wei from '@synthetixio/wei';

import { QueryStatus } from 'state/types';

export type PriceChange = 'up' | 'down' | null;

export type PricesInfo<T = Wei> = {
	price: T;
	change: PriceChange;
};

export const pricesInfoKeys = new Set(['price']);

export type PricesInfoMap = Partial<Record<AssetKey, PricesInfo<string>>>;
export type PricesInfoMapWei = Partial<Record<AssetKey, PricesInfo>>;

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
