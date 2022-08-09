import { FuturesMarketAsset } from 'utils/futures';

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS;

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`;

export const ROUTES = {
	Home: {
		Root: '/',
		Overview: normalizeRoute('/dashboard', 'overview', 'tab'),
		History: normalizeRoute('/dashboard', 'history', 'tab'),
		Markets: normalizeRoute('/dashboard', 'markets', 'tab'),
	},
	Dashboard: {
		Home: '/dashboard',
		Convert: normalizeRoute('/dashboard', 'convert', 'tab'),
		SynthBalances: normalizeRoute('/dashboard', 'synth-balances', 'tab'),
		Transactions: normalizeRoute('/dashboard', 'transactions', 'tab'),
		Deprecated: normalizeRoute('/dashboard', 'deprecated', 'tab'),
	},
	Exchange: {
		Home: '/exchange',
		MarketPair: (baseCurrencyKey: string, quoteCurrencyKey: string) =>
			`/exchange/?quote=${quoteCurrencyKey}&base=${baseCurrencyKey}`,
		Into: (currencyKey: string) => `/exchange/?quote=${currencyKey}`,
	},
	Markets: {
		Home: '/market/?asset=sETH',
		MarketPair: (marketAsset: FuturesMarketAsset | string) => `/market/?asset=${marketAsset}`,
		Position: (marketAsset: FuturesMarketAsset) => `/market/?asset=${marketAsset}&tab=position`,
		Orders: (marketAsset: FuturesMarketAsset) => `/market/?asset=${marketAsset}&tab=orders`,
		Trades: (marketAsset: FuturesMarketAsset) => `/market/?asset=${marketAsset}&tab=trades`,
		Calculator: (marketAsset: FuturesMarketAsset) => `/market/?asset=${marketAsset}&tab=calculator`,
		Transfers: (marketAsset: FuturesMarketAsset) => `/market/?asset=${marketAsset}&tab=transfers`,
	},
	Leaderboard: {
		Home: '/leaderboard',
		Trader: (trader: string) => `/leaderboard?trader=${trader}`,
	},
	Earn: {
		Home: '/earn',
	},
};

export default ROUTES;
