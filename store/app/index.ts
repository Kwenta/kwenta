import { atom } from 'recoil';
import { Language } from 'translations/constants';

import { DEFAULT_LANGUAGE, DEFAULT_PRICE_CURRENCY } from 'constants/defaults';
import { Synths } from 'constants/currency';

import { Synth } from '@synthetixio/contracts-interface';

import { getAppKey } from '../utils';

import { languageStateKey, priceCurrencyStateKey } from './constants';

export const PRICE_CURRENCIES = [
	Synths.sUSD,
	Synths.sEUR,
	Synths.sCHF,
	Synths.sAUD,
	Synths.sJPY,
	Synths.sGBP,
	Synths.sBTC,
	Synths.sETH,
];

export const appReadyState = atom({
	key: getAppKey('appReady'),
	default: false,
});

export const languageState = atom<Language>({
	key: languageStateKey,
	default: DEFAULT_LANGUAGE,
});

export const priceCurrencyState = atom<Synth>({
	key: priceCurrencyStateKey,
	default: DEFAULT_PRICE_CURRENCY,
});
