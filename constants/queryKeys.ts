import { NetworkId } from '@synthetixio/js';
import castArray from 'lodash/castArray';
import { CurrencyKey } from './currency';
import { Period } from './period';

export const QUERY_KEYS = {
	Rates: {
		HistoricalVolume: (period: Period) => ['rates', 'historicalVolume', period],
		HistoricalRates: (currencyKey: CurrencyKey | CurrencyKey[], period: Period) => [
			'rates',
			'historicalRates',
			castArray(currencyKey).join('|'),
			period,
		],
		MarketCap: (currencyKey: CurrencyKey) => ['marketCap', currencyKey],
		ExchangeRates: ['rates', 'exchangeRates'],
		SynthExchanges: (period: Period) => ['rates', 'synthExchanges', period],
	},
	Network: {
		EthGasPrice: ['network', 'ethGasPrice'],
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
	SystemStatus: {
		IsUpgrading: ['systemStatus', 'isUpgrading'],
	},
};

export default QUERY_KEYS;
