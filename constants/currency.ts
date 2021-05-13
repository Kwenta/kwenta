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

export const SYNTHS = [
	'sBTC',
	'sETH',
	'sXRP',
	'sBCH',
	'sLTC',
	'sEOS',
	'sBNB',
	'sXTZ',
	'sXMR',
	'sADA',
	'sLINK',
	'sTRX',
	'sDASH',
	'sAAVE',
	'sUNI',
	'sYFI',
	'sDOT',
	'sREN',
	'sCOMP',
	'sETC',
	'iBTC',
	'iETH',
	'iXRP',
	'iBCH',
	'iLTC',
	'iEOS',
	'iBNB',
	'iXTZ',
	'iXMR',
	'iADA',
	'iLINK',
	'iTRX',
	'iDASH',
	'iETC',
	'sFTSE',
	'sNIKKEI',
	'sTSLA',
	'sMSFT',
	'sFB',
	'sAMZN',
	'sAAPL',
	'sNFLX',
	'sGOOG',
	'sCOIN',
	'sXAU',
	'sXAG',
	'sOIL',
	'iOIL',
	'sEUR',
	'sJPY',
	'sUSD',
	'sAUD',
	'sGBP',
	'sKRW',
	'sCHF',
	'sCEX',
	'sDEFI',
	'iCEX',
	'iDEFI',
	'iAAVE',
	'iUNI',
	'iYFI',
	'iDOT',
	'iREN',
	'iCOMP',
];

export const SYNTHS_MAP = keyBy(SYNTHS);

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

export const FIAT_SYNTHS = new Set([
	SYNTHS_MAP.sEUR,
	SYNTHS_MAP.sJPY,
	SYNTHS_MAP.sUSD,
	SYNTHS_MAP.sAUD,
	SYNTHS_MAP.sGBP,
	SYNTHS_MAP.sCHF,
]);

export const LSE_SYNTHS = new Set([SYNTHS_MAP.sFTSE]);

export const TSE_SYNTHS = new Set([SYNTHS_MAP.sNIKKEI]);

export const AFTER_HOURS_SYNTHS = new Set([
	SYNTHS_MAP.sTSLA,
	SYNTHS_MAP.sMSFT,
	SYNTHS_MAP.sFB,
	SYNTHS_MAP.sAMZN,
	SYNTHS_MAP.sAAPL,
	SYNTHS_MAP.sNFLX,
	SYNTHS_MAP.sGOOG,
	SYNTHS_MAP.sCOIN,
]);

export const sUSD_EXCHANGE_RATE = 1;
export const SYNTH_DECIMALS = 18;

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
