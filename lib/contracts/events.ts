import { CurrencyKey, CurrencyKeys } from '../../constants/currency';

export type SynthExchangeEvent = {
	fromAddress: string;
	fromCurrencyKey: CurrencyKey;
	fromAmount: number;
	toCurrencyKey: CurrencyKey;
	toAmount: number;
	toAddress: string;
};

export type RatesUpdatedEvent = {
	currencyKeys: CurrencyKeys;
	rates: number[];
};

export type SynthSuspendedEvent = {
	reason: number;
};

export type SynthResumedEvent = {
	reason: number;
};

export enum SynthetixEvents {
	SYNTH_EXCHANGE = 'SynthExchange',
}

export enum ExchangeRatesEvents {
	RATES_UPDATED = 'RatesUpdated',
}

export enum SystemStatusEvents {
	SYSTEM_SUSPENDED = 'SystemSuspended',
	SYSTEM_RESUMED = 'SystemResumed',
}
