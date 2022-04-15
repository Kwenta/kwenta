import { CurrencyKey } from './currency';

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS;

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`;

export const ROUTES = {
	Home: {
		Overview: normalizeRoute('/dashboard', 'overview', 'tab'),
		Positions: normalizeRoute('/dashboard', 'positions', 'tab'),
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
	},
	Leaderboard: {
		Home: '/leaderboard',
		Trader: (trader: string) => normalizeRoute('/leaderboard', `${trader}`, 'trader'),
	},
	Shorting: {
		Home: '/shorting',
		ManageShortAddCollateral: (id: string) =>
			normalizeRoute(`/shorting/manage/add-collateral`, id, 'id'),
		ManageShortRemoveCollateral: (id: string) =>
			normalizeRoute(`/shorting/manage/remove-collateral`, id, 'id'),
		ManageShortDecreasePosition: (id: string) =>
			normalizeRoute(`/shorting/manage/decrease-position`, id, 'id'),
		ManageShortIncreasePosition: (id: string) =>
			normalizeRoute(`/shorting/manage/increase-position`, id, 'id'),
		ManageShortClosePosition: (id: string) =>
			normalizeRoute(`/shorting/manage/close-position`, id, 'id'),
	},
	Earn: {
		Home: '/earn',
	},
};

export default ROUTES;
