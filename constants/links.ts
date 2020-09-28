import { CurrencyKey } from './currency';

export const EXTERNAL_LINKS = {
	Trading: {
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
	},
	Social: {
		Twitter: 'https://twitter.com/kwenta_io',
		Medium: 'https://blog.synthetix.io/',
	},
};
