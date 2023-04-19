import Wei from '@synthetixio/wei';
import keyBy from 'lodash/keyBy';

export type CurrencyKey = string;

// TODO: standardize this
export type Category = 'crypto' | 'forex' | 'equities' | 'index' | 'commodity' | 'inverse';

export const CATEGORY: Category[] = [
	'crypto',
	'forex',
	'equities',
	'index',
	'commodity',
	'inverse',
];
export const CATEGORY_MAP = keyBy(CATEGORY);

export const CRYPTO_CURRENCY = [
	'KNC',
	'COMP',
	'REN',
	'LEND',
	'SNX',
	'BTC',
	'ETH',
	'XRP',
	'BCH',
	'LTC',
	'EOS',
	'BNB',
	'XTZ',
	'XMR',
	'ADA',
	'LINK',
	'TRX',
	'DASH',
	'ETC',
];

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);
export type FUTURES_FIAT = 'EUR' | 'JPY' | 'USD' | 'AUD' | 'GBP' | 'CHF';
export const FIAT_SYNTHS: Set<CurrencyKey | FUTURES_FIAT> = new Set([
	'sEUR',
	'sJPY',
	'sUSD',
	'sAUD',
	'sGBP',
	'sCHF',
	'EUR',
	'JPY',
	'USD',
	'AUD',
	'GBP',
	'CHF',
]);

export const LSE_SYNTHS = new Set<CurrencyKey>([]);

export const TSE_SYNTHS = new Set<CurrencyKey>([]);

export const AFTER_HOURS_SYNTHS: Set<CurrencyKey> = new Set([]);

export const MARKET_HOURS_SYNTHS = new Set([
	...FIAT_SYNTHS,
	...LSE_SYNTHS,
	...TSE_SYNTHS,
	...AFTER_HOURS_SYNTHS,
]);

// Commodity synths are not listed in the CurrencyKey currently. This is a temporary workaround.
export const COMMODITY_SYNTHS = new Set<CurrencyKey | 'XAU' | 'XAG' | 'WTI'>(['XAU', 'XAG', 'WTI']);

export const INDEX_SYNTHS = new Set<CurrencyKey | 'DebtRatio'>(['DebtRatio']);

export const sUSD_EXCHANGE_RATE = new Wei(1);
export const SYNTH_DECIMALS = 18;

export const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // For 1inch API

// For coingecko API
export const ETH_COINGECKO_ADDRESS = '0x4200000000000000000000000000000000000006';
export const KWENTA_ADDRESS = '0x920cf626a271321c151d027030d5d08af699456b';
export const OP_ADDRESS = '0x4200000000000000000000000000000000000042';

export const ATOMIC_EXCHANGES_L1 = [
	'sBTC',
	'sETH',
	'sEUR',
	'sUSD',
	'sCHF',
	'sJPY',
	'sAUD',
	'sGBP',
	'sKRW',
];

export enum SynthsName {
	sUSD = 'sUSD',
	sETH = 'sETH',
	sBTC = 'sBTC',
	sLINK = 'sLINK',
	sSOL = 'sSOL',
	sAVAX = 'sAVAX',
	sMATIC = 'sMATIC',
	sEUR = 'sEUR',
	sAAVE = 'sAAVE',
	sUNI = 'sUNI',
	sINR = 'sINR',
	sJPY = 'sJPY',
	sGBP = 'sGBP',
	sCHF = 'sCHF',
	sKRW = 'sKRW',
	sADA = 'sADA',
	sAUD = 'sAUD',
	sDOT = 'sDOT',
	sETHBTC = 'sETHBTC',
	sXMR = 'sXMR',
	sOP = 'sOP',
}
