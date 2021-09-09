import { CurrencyKey } from './currency';

const prettyURLsDisabled = !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS;

const normalizeRoute = (baseURL: string, path: string, queryParam: string) =>
	prettyURLsDisabled ? `${baseURL}?${queryParam}=${path}` : `${baseURL}/${path}`;

export const ROUTES = {
	Root: '/',
	Homepage: {
		Home: '/',
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
			normalizeRoute('/exchange', `${baseCurrencyKey}-${quoteCurrencyKey}`, 'market'),
		Into: (currencyKey: CurrencyKey) => normalizeRoute(`/exchange`, currencyKey, 'market'),
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
};

export default ROUTES;
