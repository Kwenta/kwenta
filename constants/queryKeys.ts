import { CurrencyKey } from './currency';
import { Period } from './period';

export const QUERY_KEYS = {
	Rates: {
		HistoricalVolume: (currencyKey: CurrencyKey, period: Period) => [
			'rates',
			'historicalVolume',
			currencyKey,
			period,
		],
		HistoricalRates: (currencyKey: CurrencyKey, period: Period) => [
			'rates',
			'historicalRates',
			currencyKey,
			period,
		],
		ExchangeRates: ['rates', 'exchangeRates'],
	},
	Network: {
		EthGasStation: ['network', 'ethGasStation'],
	},
	WalletBalances: {
		Synths: ['walletBalances', 'synths'],
		ETH: ['walletBalances', 'ETH'],
		Tokens: ['walletBalances', 'tokens'],
	},
	Synths: {
		FrozenSynths: ['synths', 'frozenSynths'],
	},
};

export default QUERY_KEYS;
