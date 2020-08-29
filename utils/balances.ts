import get from 'lodash/get';
import { isSynth, CurrencyKey } from '../constants/currency';

const getSynthBalancePath = (currencyKey: CurrencyKey, field: string) => [
	'synths',
	'balances',
	currencyKey,
	field,
];

// crypto appears as lowercased in balances
const getCryptoCurrencyBalancePath = (currencyKey, field) => [currencyKey.toLowerCase(), field];

export const getCurrencyKeyBalance = (balances, currencyKey) =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'balance'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'balance'));

export const getCurrencyKeyUSDBalance = (balances, currencyKey) =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'usdBalance'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'usdBalance'));

export const getCurrencyKeyUSDBalanceBN = (balances, currencyKey) =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'balanceBN'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'balanceBN'));
