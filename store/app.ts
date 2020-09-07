import { atom } from 'recoil';

import { Languages } from 'translations/constants';

import { DEFAULT_LANGUAGE } from 'constants/defaults';
import { SYNTHS_MAP } from 'constants/currency';
import { Synth } from 'lib/synthetix';

const getKey = (subKey: string) => `app/${subKey}`;

export const appReadyState = atom<boolean>({
	key: getKey('appReady'),
	default: false,
});

export const languageState = atom<Languages>({
	key: getKey('language'),
	default: DEFAULT_LANGUAGE,
});

// TODO: find a better way to init this
export const priceCurrencyState = atom<Synth>({
	key: getKey('priceCurrency'),
	default: {
		name: SYNTHS_MAP.sEUR,
		asset: 'USD',
		sign: '$',
		category: 'crypto',
		desc: '',
	},
});
