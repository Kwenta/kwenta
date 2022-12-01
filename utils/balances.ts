import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { orderBy } from 'lodash';
import get from 'lodash/get';

import { notNill } from 'queries/synths/utils';
import { SynthBalance, TokenBalances } from 'sdk/types/tokens';
import { BalancesActionReturn } from 'state/balances/types';

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

export const serializeBalances = (
	synthBalancesMap: Record<string, SynthBalance>,
	totalUSDBalance: Wei,
	tokenBalances: TokenBalances,
	susdWalletBalance: Wei
): BalancesActionReturn<string> => {
	const balancesMapSerialized = Object.entries(synthBalancesMap).reduce<
		Record<string, SynthBalance<string>>
	>((acc, [key, value]) => {
		if (value) {
			acc[key] = {
				...value,
				balance: value.balance.toString(),
				usdBalance: value.usdBalance.toString(),
			};
		}

		return acc;
	}, {});

	const balancesList = orderBy(
		Object.values(balancesMapSerialized).filter(notNill),
		(balance) => Number(balance.usdBalance),
		'desc'
	);
	return {
		synthBalances: balancesList,
		synthBalancesMap: balancesMapSerialized,
		totalUSDBalance: totalUSDBalance.toString(),
		susdWalletBalance: susdWalletBalance.toString(),
		tokenBalances: Object.entries(tokenBalances).reduce((acc, [key, value]) => {
			if (value) {
				acc[key] = { ...value, balance: value.balance.toString() };
			}

			return acc;
		}, {} as any),
	};
};

export const unserializeBalances = (
	synthBalancesMap: Record<string, SynthBalance<string>>,
	totalUSDBalance: string,
	tokenBalances: TokenBalances<string>,
	susdWalletBalance: string
): BalancesActionReturn => {
	const balancesMapSerialized = Object.entries(synthBalancesMap).reduce<
		Record<string, SynthBalance>
	>((acc, [key, value]) => {
		if (value) {
			acc[key] = {
				...value,
				balance: wei(value.balance),
				usdBalance: wei(value.usdBalance),
			};
		}

		return acc;
	}, {});

	const balancesList = orderBy(
		Object.values(balancesMapSerialized).filter(notNill),
		(balance) => balance.usdBalance.toNumber(),
		'desc'
	);
	return {
		synthBalances: balancesList,
		synthBalancesMap: balancesMapSerialized,
		totalUSDBalance: wei(totalUSDBalance),
		susdWalletBalance: wei(susdWalletBalance),
		tokenBalances: Object.entries(tokenBalances).reduce((acc, [key, value]) => {
			if (value) {
				acc[key] = { ...value, balance: wei(value.balance) };
			}

			return acc;
		}, {} as any),
	};
};
