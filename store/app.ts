import { atom } from 'recoil';

import { Languages } from 'translations/constants';

import { DEFAULT_LANGUAGE, DEFAULT_PRICE_CURRENCY } from 'constants/defaults';
import { SYNTHS_MAP } from 'constants/currency';

import localStore from 'utils/localStore';

import { Synth } from 'lib/synthetix';

const getKey = (subKey: string) => `app/${subKey}`;

export const PRICE_CURRENCIES = [
	SYNTHS_MAP.sUSD,
	SYNTHS_MAP.sEUR,
	SYNTHS_MAP.sCHF,
	SYNTHS_MAP.sAUD,
	SYNTHS_MAP.sJPY,
	SYNTHS_MAP.sGBP,
	SYNTHS_MAP.sBTC,
	SYNTHS_MAP.sETH,
];

export const appReadyState = atom<boolean>({
	key: getKey('appReady'),
	default: false,
});

export const languageState = atom<Languages>({
	key: getKey('language'),
	default: DEFAULT_LANGUAGE,
});

// TODO: find a better way to init this
const priceCurrencyStateKey = getKey('priceCurrency');
export const priceCurrencyState = atom<Synth>({
	key: priceCurrencyStateKey,
	default: localStore.get(priceCurrencyStateKey) ?? DEFAULT_PRICE_CURRENCY,
});
