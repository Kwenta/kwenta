import { CurrencyKey } from './currency';

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS;

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`;

export const ROUTES = {
	Home: '/',
	Position: normalizeRoute(`/`, 'position', 'tab'),
	Trades: normalizeRoute(`/`, 'trades', 'tab'),
	Markets: {
		Home: '/market/sBTC',
		MarketPair: (baseCurrencyKey: CurrencyKey | string) =>
			normalizeRoute('/market', `${baseCurrencyKey}`, 'market'),
		Position: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'position', 'tab'),
		Orders: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'orders', 'tab'),
		Trades: (baseCurrencyKey: CurrencyKey) =>
			normalizeRoute(`/market/${baseCurrencyKey}`, 'trades', 'tab'),
	},
	Leaderboard: {
		Home: '/leaderboard',
		Leaderboard: normalizeRoute('/leaderboard', 'leaderboard', 'tab'),
		Statistics: normalizeRoute('/leaderboard', 'statistics', 'tab'),
	},
};

export default ROUTES;
