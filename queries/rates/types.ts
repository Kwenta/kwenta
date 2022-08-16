import Wei from '@synthetixio/wei';

import { CurrencyKey } from 'constants/currency';
import { FuturesMarketAsset } from 'utils/futures';

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
	open: number;
	high: number;
	low: number;
	average?: number;
	close: number;
	timestamp: number;
};

export type Candles = Candle[];

export type LatestRate = {
	id: string;
	rate: Wei;
};

export type LatestRates = Partial<Record<FuturesMarketAsset, Wei>>;

export type Price = {
	synth: string;
	price: number;
};

export type Prices = Price[];

export type Rates = Record<string, Wei>;

export type PriceResponse = Record<string, { usd: number }>;
