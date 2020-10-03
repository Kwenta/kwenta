import { CurrencyKey } from './currency';

export const ROUTES = {
	Root: '/',
	Homepage: {
		Home: '/',
		How: '/#how',
	},
	Dashboard: {
		Home: '/dashboard',
		Convert: '/dashboard/convert',
	},
	Exchange: {
		Home: '/exchange',
		MarketPair: (baseCurrencyKey: CurrencyKey, quoteCurrencyKey: CurrencyKey) =>
			`/exchange/${baseCurrencyKey}-${quoteCurrencyKey}`,
		Into: (currencyKey: CurrencyKey) => `/exchange/${currencyKey}`,
	},
};

export default ROUTES;
