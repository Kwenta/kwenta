import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';
import get from 'lodash/get';

import { CurrencyKey } from '../constants/currency';
import { isSynth } from './currencies';

type BalancesMap = Record<CurrencyKey, number>;

type SynthBalances = {
	synths: {
		balances: BalancesMap;
	};
};

type Balances = SynthBalances & BalancesMap;

const getSynthBalancePath = (currencyKey: CurrencyKey, field: string) => [
	'synths',
	'balances',
	currencyKey,
	field,
];

// crypto appears as lowercased in balances
const getCryptoCurrencyBalancePath = (currencyKey: CurrencyKey, field: string) => [
	currencyKey.toLowerCase(),
	field,
];

export const getCurrencyKeyBalance = (balances: Balances, currencyKey: CurrencyKey): number =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'balance'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'balance'));

export const getCurrencyKeyUSDBalance = (balances: Balances, currencyKey: CurrencyKey): number =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'usdBalance'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'usdBalance'));

export const getCurrencyKeyUSDBalanceBN = (
	balances: Balances,
	currencyKey: CurrencyKey
): ethers.BigNumber =>
	isSynth(currencyKey)
		? get(balances, getSynthBalancePath(currencyKey, 'balanceBN'))
		: get(balances, getCryptoCurrencyBalancePath(currencyKey, 'balanceBN'));

export const sortWei = (a: Wei, b: Wei, order: 'descending' | 'ascending'): number => {
	const diff = order === 'ascending' ? a.sub(b) : b.sub(a);

	if (diff.gt(0)) {
		return 1;
	} else if (diff.lt(0)) {
		return -1;
	} else {
		return 0;
	}
};
