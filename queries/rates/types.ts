import { CurrencyKey } from 'constants/currency';

export type SynthExchange = {
	block: number;
	date: Date;
	feesInUSD: number;
	fromAddress: string;
	fromAmount: number;
	fromAmountInUSD: number;
	fromCurrencyKey: CurrencyKey;
	fromCurrencyKeyBytes: string;
	gasPrice: number;
	hash: string;
	timestamp: number;
	toAddress: string;
	toAmount: number;
	toAmountInUSD: number;
	toCurrencyKey: CurrencyKey;
	toCurrencyKeyBytes: string;
};

export type SynthExchanges = SynthExchange[];

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

export type HistoricalRatesUpdates = {
	rates: RateUpdates;
	low: number;
	high: number;
	change: number;
};

export type MarketCap = {
	marketCap: number;
};
