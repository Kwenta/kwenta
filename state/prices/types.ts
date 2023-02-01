import { LatestRate, PricesMap } from 'sdk/types/prices';
import { QueryStatus } from 'state/types';

export type PricesQueryStatuses = {
	previousDayRates: QueryStatus;
};

export type PricesState = {
	onChainPrices: PricesMap<string>;
	offChainPrices: PricesMap<string>;
	connectionError: string | null | undefined;
	previousDayRates: LatestRate[];
	queryStatuses: PricesQueryStatuses;
};
