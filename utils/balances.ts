import get from 'lodash/get';
import { CurrencyKey } from 'constants/currency';
import { isSynth } from './currencies';

import { WalletBalances } from 'queries/walletBalances/types';

const getSynthBalancePath = (currencyKey: CurrencyKey, field: string) => [
	'synths',
	'balances',
	currencyKey,
	field,
];

const getCryptoCurrencyBalancePath = (currencyKey: CurrencyKey, field: string) => [
	currencyKey.toLowerCase(),
	field,
];

export const getCurrencyKeyBalance = (balances: WalletBalances, currencyKey: CurrencyKey) =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'balance'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'balance'));

export const getCurrencyKeyUSDBalance = (balances: WalletBalances, currencyKey: CurrencyKey) =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'usdBalance'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'usdBalance'));

export const getCurrencyKeyUSDBalanceBN = (balances: WalletBalances, currencyKey: CurrencyKey) =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'balanceBN'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'balanceBN'));
