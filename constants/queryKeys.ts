import { NetworkId } from '@synthetixio/contracts-interface';

import { CurrencyKey } from './currency';
import { Period } from './period';

export const QUERY_KEYS = {
	Rates: {
		HistoricalVolume: (period: Period) => ['rates', 'historicalVolume', period],
		HistoricalRates: (currencyKey: string, period: Period) => [
			'rates',
			'historicalRates',
			period,
			currencyKey,
		],
		MarketCap: (currencyKey: string) => ['marketCap', currencyKey],
		ExchangeRates: ['rates', 'exchangeRates'],
		SynthExchanges: (period: Period) => ['rates', 'synthExchanges', period],
		Candlesticks: (currencyKey: string, period: Period) => [
			'rates',
			'candlesticks',
			currencyKey,
			period,
		],
		PeriodStartSynthRate: (currencyKey: CurrencyKey, period: Period) => [
			'rates',
			'latestSynthRate',
			currencyKey,
			period,
		],
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
	Collateral: {
		ShortHistory: (walletAddress: string, networkId: NetworkId) => [
			'collateral',
			'short',
			'history',
			walletAddress,
			networkId,
		],
		ShortContractInfo: ['collateral', 'short', 'contractInfo'],
		ShortPosition: (loanId: string) => ['collateral', 'short', 'position', loanId],
		ShortPositionPnL: (loanId: string) => ['collateral', 'short', 'position', 'pnl', loanId],
		ShortRewards: (currencyKey: string) => ['collateral', 'short', 'rewards', currencyKey],
		ShortRate: (currencyKey: string) => ['collateral', 'short', 'rate', currencyKey],
		ShortStats: (currencyKey: string) => ['collateral', 'short', 'stats', currencyKey],
	},
	Trades: {
		AllTrades: ['trades', 'allTrades'],
		WalletTrades: (walletAddress: string) => ['trades', 'walletTrades', walletAddress],
	},
	SystemStatus: {
		IsUpgrading: ['systemStatus', 'isUpgrading'],
	},
	Convert: {
		quote1Inch: (
			quoteCurrencyKey: string,
			baseCurrencyKey: string,
			amount: string,
			networkId: NetworkId
		) => ['convert', '1inch', quoteCurrencyKey, baseCurrencyKey, amount, networkId],
		approveAddress1Inch: ['convert', '1inch', 'approve', 'address'],
	},
	TokenLists: {
		Synthetix: ['tokenLists', 'synthetix'],
		Zapper: ['tokenLists', 'zapper'],
		OneInch: ['tokenLists', 'oneInch'],
	},
	CMC: {
		Quotes: (currencyKeys: string[]) => ['cmc', 'quotes', currencyKeys.join('|')],
	},
	CoinGecko: {
		CoinList: ['cg', 'coinList'],
		TokenPrices: (tokenAddresses: string[]) => ['cg', 'prices', tokenAddresses.join('|')],
		Prices: (priceIds: string[]) => ['cg', 'prices', priceIds.join('|')],
	},
};

export default QUERY_KEYS;
