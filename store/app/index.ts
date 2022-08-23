import { Synth } from '@synthetixio/contracts-interface';
import { atom } from 'recoil';
import { Language } from 'translations/constants';

import { DEFAULT_LANGUAGE, DEFAULT_PRICE_CURRENCY } from 'constants/defaults';

import { getAppKey } from '../utils';
import { languageStateKey, priceCurrencyStateKey } from './constants';

export const PRICE_CURRENCIES = ['sUSD', 'sEUR', 'sCHF', 'sAUD', 'sJPY', 'sGBP', 'sBTC', 'sETH'];

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
