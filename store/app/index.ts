import { atom } from 'recoil';
import { Language } from 'translations/constants';

import { DEFAULT_LANGUAGE, DEFAULT_PRICE_CURRENCY } from 'constants/defaults';
import { Period } from 'constants/period';
import { SYNTHS_MAP } from 'constants/currency';
import { ChartType } from 'constants/chartType';
import { Synth } from 'lib/synthetix';

import { getAppKey } from '../utils';

import {
	languageStateKey,
	priceCurrencyStateKey,
	singleChartPeriodStateKey,
	baseChartPeriodStateKey,
	quoteChartPeriodStateKey,
	singleChartTypeStateKey,
	baseChartTypeStateKey,
	quoteChartTypeStateKey,
} from './constants';

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

export const singleChartPeriodState = atom<Period>({
	key: singleChartPeriodStateKey,
	default: Period.ONE_DAY,
});
export const baseChartPeriodState = atom<Period>({
	key: baseChartPeriodStateKey,
	default: Period.ONE_DAY,
});
export const quoteChartPeriodState = atom<Period>({
	key: quoteChartPeriodStateKey,
	default: Period.ONE_DAY,
});

export const singleChartTypeState = atom<ChartType>({
	key: singleChartTypeStateKey,
	default: ChartType.AREA,
});
export const baseChartTypeState = atom<ChartType>({
	key: baseChartTypeStateKey,
	default: ChartType.AREA,
});
export const quoteChartTypeState = atom<ChartType>({
	key: quoteChartTypeStateKey,
	default: ChartType.AREA,
});
