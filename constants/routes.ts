import { CurrencyKey } from './currency';

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
		Into: (currencyKey: CurrencyKey) => normalizeRoute(`/exchange`, currencyKey, 'market'),
	},
	Markets: {
		Home: '/market/sETH',
		MarketPair: (baseCurrencyKey: CurrencyKey | string) =>
			normalizeRoute('/market', `${baseCurrencyKey}`, 'market'),
		Position: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'position', 'tab'),
		Orders: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'orders', 'tab'),
		Trades: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'trades', 'tab'),
		Calculator: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'calculator', 'tab'),
		Transfers: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'transfers', 'tab'),
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
