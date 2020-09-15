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
		MarketCap: (currencyKey: CurrencyKey) => ['marketCap', currencyKey],
		ExchangeRates: ['rates', 'exchangeRates'],
	},
	Network: {
		EthGasStation: ['network', 'ethGasStation'],
	},
	WalletBalances: {
		Synths: (walletAddress: string) => ['walletBalances', 'synths', walletAddress],
		ETH: (walletAddress: string) => ['walletBalances', 'ETH', walletAddress],
		Tokens: (walletAddress: string) => ['walletBalances', 'tokens', walletAddress],
	},
	Synths: {
		FrozenSynths: ['synths', 'frozenSynths'],
		Suspension: (currencyKey: CurrencyKey) => ['synths', 'suspension', currencyKey],
	},
};

export default QUERY_KEYS;
