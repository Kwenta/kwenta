import { NetworkId } from '@synthetixio/js';
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
		SynthExchanges: (period: Period) => ['rates', 'synthExchanges', period],
	},
	Network: {
		EthGasStation: ['network', 'ethGasStation'],
	},
	WalletBalances: {
		Synths: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'synths',
			walletAddress,
			networkId,
		],
		ETH: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'ETH',
			walletAddress,
			networkId,
		],
		Tokens: (walletAddress: string, networkId: NetworkId) => [
			'walletBalances',
			'tokens',
			walletAddress,
			networkId,
		],
	},
	Synths: {
		FrozenSynths: ['synths', 'frozenSynths'],
		Suspension: (currencyKey: CurrencyKey) => ['synths', 'suspension', currencyKey],
		FeeReclaimPeriod: (currencyKey: CurrencyKey) => ['synths', 'feeReclaimPeriod', currencyKey],
		ExchangeFeeRate: (quoteCurrencyKey: CurrencyKey, baseCurrencyKey: CurrencyKey) => [
			'synths',
			'exchangeFeeRate',
			quoteCurrencyKey,
			baseCurrencyKey,
		],
	},
	Trades: {
		AllTrades: ['trades', 'allTrades'],
		WalletTrades: (walletAddress: string) => ['trades', 'walletTrades', walletAddress],
	},
};

export default QUERY_KEYS;
