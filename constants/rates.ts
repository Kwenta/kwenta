import { CurrencyKey } from './currency';

export type BaseRateUpdate = {
	timestamp: number;
	rate: number;
};

export type BaseRateUpdates = BaseRateUpdate[];

export type RateUpdate = BaseRateUpdate & {
	block: number;
	synth: CurrencyKey;
	date: string;
	hash: string;
};

export type RateUpdates = RateUpdate[];
