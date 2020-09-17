import { CurrencyKey } from 'constants/currency';

export type HistoricalTrade = {
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
	price: number;
	amount: number;
	isSettled: boolean;
	reclaim: number;
	rebate: number;
	settledPrice: number;
};

export type HistoricalTrades = HistoricalTrade[];
