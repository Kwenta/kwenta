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
	Trades: normalizeRoute(`/`, 'trades', 'tab'),
	Exchange: {
		Home: '/exchange',
		MarketPair: (baseCurrencyKey: string, quoteCurrencyKey: string) =>
			normalizeRoute('/exchange', `${baseCurrencyKey}-${quoteCurrencyKey}`, 'market'),
		Into: (currencyKey: string) => normalizeRoute(`/exchange`, currencyKey, 'market'),
	},
	Markets: {
		Home: '/market/sETH',
		MarketPair: (marketAsset: FuturesMarketAsset | string) =>
			normalizeRoute('/market', `${marketAsset}`, 'market'),
		Position: (marketAsset: FuturesMarketAsset) =>
			normalizeRoute(`/market/${marketAsset}`, 'position', 'tab'),
		Orders: (marketAsset: FuturesMarketAsset) =>
			normalizeRoute(`/market/${marketAsset}`, 'orders', 'tab'),
		Trades: (marketAsset: FuturesMarketAsset) =>
			normalizeRoute(`/market/${marketAsset}`, 'trades', 'tab'),
		Calculator: (marketAsset: FuturesMarketAsset) =>
			normalizeRoute(`/market/${marketAsset}`, 'calculator', 'tab'),
		Transfers: (marketAsset: FuturesMarketAsset) =>
			normalizeRoute(`/market/${marketAsset}`, 'transfers', 'tab'),
	},
	Stats: {
		Home: '/stats',
	},
	Leaderboard: {
		Home: '/leaderboard',
		Trader: (trader: string) => normalizeRoute('/leaderboard', `${trader}`, 'trader'),
	},
	Earn: {
		Home: '/earn',
	},
};

export default ROUTES;
