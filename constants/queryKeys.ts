import { NetworkId } from '@synthetixio/contracts-interface';
import { CurrencyKey } from './currency';
import { Period } from './period';

export const QUERY_KEYS = {
	Rates: {
		HistoricalVolume: (period: Period, networkId: NetworkId) => [
			'rates',
			'historicalVolume',
			period,
			networkId,
		],
		HistoricalRates: (currencyKey: string, period: Period, networkId: NetworkId) => [
			'rates',
			'historicalRates',
			currencyKey,
			period,
			networkId,
		],
		MarketCap: (currencyKey: string) => ['marketCap', currencyKey],
		ExchangeRates: ['rates', 'exchangeRates'],
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
		ExchangeFeeRate: (quoteCurrencyKey: CurrencyKey, baseCurrencyKey: CurrencyKey) => [
			'synths',
			'exchangeFeeRate',
			quoteCurrencyKey,
			baseCurrencyKey,
		],
		BaseFeeRate: (currencyKey: CurrencyKey) => ['synths', 'baseFeeRate', currencyKey],
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
		WalletTrades: (walletAddress: string, networkId: NetworkId) => [
			'trades',
			'walletTrades',
			walletAddress,
			networkId,
		],
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
		Prices: (priceIds: string[]) => ['cg', 'prices', priceIds.join('|')],
		TokenPrices: (tokenAddresses: string[]) => ['cg', 'prices', tokenAddresses.join('|')],
	},
	Futures: {
		DayTradeStats: ['futures', 'dayTradeStats'],
		Markets: ['futures', 'marketsSummaries'],
		OpenInterest: (currencyKeys: string[]) => ['futures', 'openInterest', currencyKeys],
		TradingVolume: (currencyKey: string | null) => ['futures', 'tradingVolume', currencyKey],
		MarketPositionHistory: (market: string | null, walletAddress: string) => [
			'futures',
			'marketPositionHistory',
			market,
			walletAddress,
		],
		AllPositionHistory: (walletAddress: string) => ['futures', 'allPositionHistory', walletAddress],
		Position: (market: string | null, walletAddress: string) => [
			'futures',
			'position',
			market,
			walletAddress,
		],
		Positions: (markets: string[] | [], walletAddress: string) => [
			'futures',
			'positions',
			markets,
			walletAddress,
		],
		Participants: () => ['futures', 'participants'],
		Participant: (walletAddress: string) => ['futures', 'participant', walletAddress],
		Stats: ['futures', 'stats'],
		AverageLeverage: ['futures', 'averageLeverage'],
		CumulativeVolume: ['futurs', 'cumulativeVolume'],
		TotalLiquidations: ['futures', 'totalLiquidations'],
		TotalTrades: ['futures', 'totalTrades'],
	},
};

export default QUERY_KEYS;
