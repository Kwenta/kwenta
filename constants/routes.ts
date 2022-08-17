import { FuturesAccountType } from 'queries/futures/types';
import { FuturesMarketAsset } from 'utils/futures';

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS;

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`;

export const formatUrl = (route: string, params: Record<string, string>) => {
	return route + '?' + new URLSearchParams(params);
};

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
	Trades: normalizeRoute(`/`, 'trades', 'tab'),
	Exchange: {
		Home: '/exchange',
		MarketPair: (baseCurrencyKey: string, quoteCurrencyKey: string) =>
			normalizeRoute('/exchange', `${baseCurrencyKey}-${quoteCurrencyKey}`, 'market'),
		Into: (currencyKey: string) => normalizeRoute(`/exchange`, currencyKey, 'market'),
	},
	Markets: {
		Home: (accountType: FuturesAccountType) => formatUrl('/market/sETH', { accountType }),
		MarketPair: (marketAsset: FuturesMarketAsset | string, accountType: FuturesAccountType) =>
			formatUrl(normalizeRoute('/market', `${marketAsset}`, 'market'), { accountType }),
		Position: (marketAsset: FuturesMarketAsset, accountType: FuturesAccountType) =>
			formatUrl(normalizeRoute(`/market/${marketAsset}`, 'position', 'tab'), { accountType }),
		Orders: (marketAsset: FuturesMarketAsset, accountType: FuturesAccountType) =>
			formatUrl(normalizeRoute(`/market/${marketAsset}`, 'orders', 'tab'), { accountType }),
		Trades: (marketAsset: FuturesMarketAsset, accountType: FuturesAccountType) =>
			formatUrl(normalizeRoute(`/market/${marketAsset}`, 'trades', 'tab'), { accountType }),
		Calculator: (marketAsset: FuturesMarketAsset, accountType: FuturesAccountType) =>
			formatUrl(normalizeRoute(`/market/${marketAsset}`, 'calculator', 'tab'), { accountType }),
		Transfers: (marketAsset: FuturesMarketAsset, accountType: FuturesAccountType) =>
			formatUrl(normalizeRoute(`/market/${marketAsset}`, 'transfers', 'tab'), { accountType }),
	},
	Leaderboard: {
		Home: '/leaderboard',
		Trader: (trader: string) => normalizeRoute('/leaderboard', `${trader}`, 'trader'),
	},
	Earn: {
		Home: '/earn',
	},
};

export const setLastVisited = (baseCurrencyPair: string, accountType: FuturesAccountType): void => {
	localStorage.setItem('lastVisited', ROUTES.Markets.MarketPair(baseCurrencyPair, accountType));
};

export default ROUTES;
