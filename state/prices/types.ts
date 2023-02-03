import { SynthPrice, PricesMap } from 'sdk/types/prices';
import { QueryStatus } from 'state/types';

export type PricesQueryStatuses = {
	previousDayPrices: QueryStatus;
};

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
	connectionError: string | null | undefined;
	previousDayPrices: SynthPrice[];
	queryStatuses: PricesQueryStatuses;
};
