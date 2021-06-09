import { CurrencyKey } from 'constants/currency';

export type SynthExchange = {
	block: number;
	feesInUSD: number;
	from: string;
	fromAmount: number;
	fromAmountInUSD: number;
	fromCurrencyKey: CurrencyKey;
	gasPrice: number;
	timestamp: number;
	toAddress: string;
	toAmount: number;
	toAmountInUSD: number;
	toCurrencyKey: CurrencyKey;
	id: string;
	account: string;
	network: string;
	hash: string;
};

export type SynthExchanges = SynthExchange[];

export type RateUpdate = {
	timestamp: number;
	rate: number;
	block?: number;
	synth?: CurrencyKey;
};

export type RateUpdates = RateUpdate[];

export type HistoricalRatesUpdates = {
	rates: RateUpdates;
	low: number;
	high: number;
	change: number;
};

export type Candle = {
	id: string;
	synth: string;
	open: BigInt;
	high: BigInt;
	low: BigInt;
	close: BigInt;
	timestamp: BigInt;
};

export type MarketCap = {
	marketCap: number;
};
