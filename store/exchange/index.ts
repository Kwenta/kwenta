import { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';
import { atom, selector } from 'recoil';

import { CurrencyKey, CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { SwapRatio } from 'hooks/useExchange';
import { localStorageEffect } from 'store/effects';
import { getExchangeKey } from 'store/utils';
import { zeroBN } from 'utils/formatters/number';

type CurrencyPair = {
	base: CurrencyKey | null;
	quote: CurrencyKey | null;
};

export const currencyPairState = atom<CurrencyPair>({
	key: getExchangeKey('currencyPair'),
	default: {
		base: null,
		quote: 'sUSD',
	},
	effects: [localStorageEffect('exchange/currencyPair')],
});

export const baseCurrencyKeyState = selector<CurrencyKey | null>({
	key: getExchangeKey('baseCurrencyKey'),
	get: ({ get }) => {
		return get(currencyPairState).base;
	},
});

export const quoteCurrencyKeyState = selector<CurrencyKey | null>({
	key: getExchangeKey('quoteCurrencyKey'),
	get: ({ get }) => {
		return get(currencyPairState).quote;
	},
});

export const isBaseCurrencyETHState = selector<boolean>({
	key: getExchangeKey('isBaseCurrencyETH'),
	get: ({ get }) => {
		return get(baseCurrencyKeyState) === CRYPTO_CURRENCY_MAP.ETH;
	},
});

export const isQuoteCurrencyETHState = selector<boolean>({
	key: getExchangeKey('isQuoteCurrencyETH'),
	get: ({ get }) => {
		return get(quoteCurrencyKeyState) === CRYPTO_CURRENCY_MAP.ETH;
	},
});

export const txErrorState = atom<string | null>({
	key: getExchangeKey('txError'),
	default: null,
});

export const baseCurrencyAmountState = atom<string>({
	key: getExchangeKey('baseCurrencyAmount'),
	default: '',
});

export const quoteCurrencyAmountState = atom<string>({
	key: getExchangeKey('quoteCurrencyAmount'),
	default: '',
});

export const ratioState = atom<SwapRatio | undefined>({
	key: getExchangeKey('ratio'),
	default: undefined,
});

export const destinationCurrencyKeyState = selector({
	key: getExchangeKey('destinationCurrencyKey'),
	get: ({ get }) => {
		const baseCurrencyKey = get(baseCurrencyKeyState);
		return baseCurrencyKey ? ethers.utils.formatBytes32String(baseCurrencyKey) : null;
	},
});

export const sourceCurrencyKeyState = selector({
	key: getExchangeKey('sourceCurrencyKey'),
	get: ({ get }) => {
		const quoteCurrencyKey = get(quoteCurrencyKeyState);
		return quoteCurrencyKey ? ethers.utils.formatBytes32String(quoteCurrencyKey) : null;
	},
});

export const isApprovingState = atom({
	key: getExchangeKey('isApproving'),
	default: false,
});

export const isApprovedState = atom({
	key: getExchangeKey('isApproved'),
	default: false,
});

export const quoteCurrencyAmountBNState = selector({
	key: getExchangeKey('quoteCurrencyAmountBN'),
	get: ({ get }) => {
		const quoteCurrencyAmount = get(quoteCurrencyAmountState);
		return quoteCurrencyAmount === '' ? zeroBN : wei(quoteCurrencyAmount);
	},
});

export const baseCurrencyAmountBNState = selector({
	key: getExchangeKey('baseCurrencyAmountBN'),
	get: ({ get }) => {
		const baseCurrencyAmount = get(baseCurrencyAmountState);
		return baseCurrencyAmount === '' ? zeroBN : wei(baseCurrencyAmount);
	},
});
