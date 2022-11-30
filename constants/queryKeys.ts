import { NetworkId } from '@synthetixio/contracts-interface';

import { FuturesAccountType } from 'queries/futures/types';
import { Period } from 'sdk/constants/period';
import { FuturesMarketAsset } from 'utils/futures';

import { CurrencyKey } from './currency';

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
		PastRates: (networkId: NetworkId, assets: (FuturesMarketAsset | CurrencyKey)[]) => [
			'rates',
			'pastRates',
			networkId,
			assets,
		],
		ExternalPrice: (currencyKey: string) => ['rates', 'externalPrice', currencyKey],
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
		ENSNames: (addresses: string[]) => ['network', 'ensNames', addresses],
		ENSAvatar: (ensName: string | null) => ['network', 'ensNames', ensName],
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
		Tokens: (walletAddress: string | null, networkId: NetworkId, tokenAddresses: string) => [
			'walletBalances',
			'tokens',
			walletAddress,
			networkId,
			tokenAddresses,
		],
	},
	Synths: {
		Balances: (networkId: NetworkId, walletAddress: string | null) => [
			'synths',
			'balances',
			networkId,
			walletAddress,
		],
		FrozenSynths: ['synths', 'frozenSynths'],
		Suspension: (currencyKey: CurrencyKey) => ['synths', 'suspension', currencyKey],
		ExchangeFeeRate: (sourceCurrencyKey: CurrencyKey, destinationCurrencyKey: CurrencyKey) => [
			'synths',
			'exchangeFeeRate',
			sourceCurrencyKey,
			destinationCurrencyKey,
		],
		BaseFeeRate: (sourceCurrencyKey: CurrencyKey, destinationCurrencyKey: CurrencyKey) => [
			'synths',
			'baseFeeRate',
			sourceCurrencyKey,
			destinationCurrencyKey,
		],
		NumEntries: (walletAddress: string, currencyKey: CurrencyKey) => [
			'synths',
			'numEntries',
			walletAddress,
			currencyKey,
		],
		TradingVolumeForAllSynths: (networkId: NetworkId) => ['synths', 'tradingVolume', networkId],
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
			quoteCurrencyKey: string | undefined,
			baseCurrencyKey: string | undefined,
			amount: string,
			synthUsdRate: number,
			networkId: NetworkId
		) => ['convert', '1inch', quoteCurrencyKey, baseCurrencyKey, amount, networkId, synthUsdRate],
		quoteSynthSwap: (
			quoteCurrencyKey: string | undefined,
			baseCurrencyKey: string | undefined,
			amount: string,
			networkId: NetworkId
		) => ['convert', 'synthSwap', quoteCurrencyKey, baseCurrencyKey, amount, networkId],
		approveAddress1Inch: ['convert', '1inch', 'approve', 'address'],
	},
	TokenLists: {
		Synthetix: ['tokenLists', 'synthetix'],
		Zapper: ['tokenLists', 'zapper'],
		OneInch: (networkId: NetworkId) => ['tokenLists', 'oneInch', networkId],
	},
	CMC: {
		Quotes: (currencyKeys: string[]) => ['cmc', 'quotes', currencyKeys.join('|')],
	},
	CoinGecko: {
		CoinList: ['cg', 'coinList'],
		Prices: (priceIds: string[]) => ['cg', 'prices', priceIds.join('|')],
		Price: (priceId: string) => ['cg', 'price', priceId],
		TokenPrices: (tokenAddresses: string[], platform: string) => [
			'cg',
			'prices',
			tokenAddresses.join('|'),
			platform,
		],
	},
	Futures: {
		DayTradeStats: (networkId: NetworkId, currencyKey: FuturesMarketAsset | null) => [
			'futures',
			'dayTradeStats',
			networkId,
			currencyKey,
		],
		Market: (networkId: NetworkId, currencyKey: string | null) => [
			'futures',
			currencyKey,
			networkId,
		],
		Trades: (networkId: NetworkId, currencyKey: string | null) => [
			'futures',
			'trades',
			networkId,
			currencyKey,
		],
		TradesAccount: (
			networkId: NetworkId,
			currencyKey: string | null,
			account: string | null,
			selectedAccountType: string
		) => ['futures', 'trades', networkId, currencyKey, account, selectedAccountType],
		AllTradesAccount: (networkId: NetworkId, account: string | null) => [
			'futures',
			'trades',
			networkId,
			account,
		],
		MarketClosure: (networkId: NetworkId, currencyKey: string | null) => [
			'futures',
			'closures',
			networkId,
			currencyKey,
		],
		OpenInterest: (currencyKeys: string[]) => ['futures', 'openInterest', currencyKeys],
		TradingVolume: (networkId: NetworkId, currencyKey: string | null) => [
			'futures',
			'tradingVolume',
			networkId,
			currencyKey,
		],
		MarginTransfers: (
			networkId: NetworkId,
			walletAddress: string | null,
			currencyKey: string | null
		) => ['futures', 'futuresMarginTransfers', networkId, walletAddress, currencyKey],
		FundingRate: (networkId: NetworkId, currencyKey: string | null) => [
			'futures',
			'fundingRates',
			networkId,
			currencyKey,
		],
		TradingVolumeForAll: (networkId: NetworkId) => ['futures', 'tradingVolumeForAll', networkId],
		Position: (networkId: NetworkId, market: string | null, walletAddress: string) => [
			'futures',
			'position',
			networkId,
			market,
			walletAddress,
		],
		PositionHistory: (walletAddress: string | null, networkId: NetworkId) => [
			'futures',
			'accountPositions',
			walletAddress,
			networkId,
		],
		Participants: () => ['futures', 'participants'],
		Participant: (walletAddress: string) => ['futures', 'participant', walletAddress],
		Stats: (networkId: NetworkId) => ['futures', 'stats', networkId],
		Leaderboard: (networkId: NetworkId, searchTerm: string) => [
			'futures',
			'leaderboard',
			networkId,
			searchTerm,
		],
		AverageLeverage: ['futures', 'averageLeverage'],
		CumulativeVolume: ['futures', 'cumulativeVolume'],
		TotalLiquidations: ['futures', 'totalLiquidations'],
		TotalTrades: (networkId: NetworkId) => ['futures', 'totalTrades', networkId],
		TotalVolume: ['futures', 'totalVolume'],
		PotentialTrade: (
			networkId: NetworkId,
			market: string | null,
			tradeSize: string,
			walletAddress: string,
			selectedAccountType: FuturesAccountType,
			marginDelta: string,
			leverageSide: string
		) => [
			'futures',
			'potentialTrade',
			tradeSize,
			networkId,
			market,
			walletAddress,
			selectedAccountType,
			marginDelta,
			leverageSide,
		],
		MarketLimit: (networkId: NetworkId, market: string | null) => [
			'futures',
			'marketLimit',
			networkId,
			market,
		],
		OpenOrders: (networkId: NetworkId, walletAddress: string | null) => [
			'futures',
			'openOrders',
			networkId,
			walletAddress,
		],
		LatestUpdate: (networkId: NetworkId, market: string | null) => [
			'futures',
			'latestUpdate',
			networkId,
			market,
		],
		NextPriceDetails: (
			networkId: NetworkId,
			walletAddress: string | null,
			currencyKey: string | null
		) => ['futures', 'currentRoundId', networkId, walletAddress, currencyKey],
		OverviewStats: (networkId: NetworkId) => ['futures', 'overview-stats', networkId],
		CrossMarginSettings: (networkId: NetworkId, settingsAddress: string) => [
			'futures',
			'cross-margin-settings',
			networkId,
			settingsAddress,
		],
	},
	Files: {
		Get: (fileName: string) => ['files', 'get', fileName],
		GetMultiple: (fileNames: string[]) => ['files', 'getMultiple', fileNames],
	},
	Staking: {
		Rewards: (walletAddress: string | null) => ['staking', 'rewards', 'balance', walletAddress],
		SpotsFee: (walletAddress: string | null, start: number, end: number) => [
			'staking',
			'rewards',
			'spots-fee',
			walletAddress,
			start,
			end,
		],
		FuturesFee: (walletAddress: string | null, start: number, end: number) => [
			'staking',
			'rewards',
			'futures-fee',
			walletAddress,
			start,
			end,
		],
	},
};

export default QUERY_KEYS;
