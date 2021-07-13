import { CurrencyKey } from '@synthetixio/contracts-interface';
import keyBy from 'lodash/keyBy';

import { Synths } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';

export type { CurrencyKey } from '@synthetixio/contracts-interface';
export { Synths } from '@synthetixio/contracts-interface';

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

export const FIAT_SYNTHS: Set<CurrencyKey> = new Set([
	Synths.sEUR,
	Synths.sJPY,
	Synths.sUSD,
	Synths.sAUD,
	Synths.sGBP,
	Synths.sCHF,
]);

export const LSE_SYNTHS = new Set<CurrencyKey>([Synths.sFTSE]);

export const TSE_SYNTHS = new Set<CurrencyKey>([Synths.sNIKKEI]);

export const AFTER_HOURS_SYNTHS: Set<CurrencyKey> = new Set([
	Synths.sTSLA,
	Synths.sMSFT,
	Synths.sFB,
	Synths.sAMZN,
	Synths.sAAPL,
	Synths.sNFLX,
	Synths.sGOOG,
	Synths.sCOIN,
]);

export const COMMODITY_SYNTHS = new Set<CurrencyKey>([Synths.sXAU, Synths.sXAG, Synths.sOIL]);

export const sUSD_EXCHANGE_RATE = new Wei(1);
export const SYNTH_DECIMALS = 18;

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
