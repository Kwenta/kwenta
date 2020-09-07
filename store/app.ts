import { atom } from 'recoil';

import { Languages } from 'translations/constants';

import { DEFAULT_LANGUAGE } from 'constants/defaults';
import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';

const getKey = (subKey: string) => `app/${subKey}`;

export const appReadyState = atom<boolean>({
	key: getKey('appReady'),
	default: false,
});

export const languageState = atom<Languages>({
	key: getKey('language'),
	default: DEFAULT_LANGUAGE,
});

export const priceCurrencyState = atom<CurrencyKey>({
	key: getKey('selectedPriceCurrency'),
	default: SYNTHS_MAP.sEUR,
});
