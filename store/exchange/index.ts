import { atom, selector } from 'recoil';

import { Synths, CurrencyKey, CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { SwapRatio } from 'hooks/useExchange';
import { localStorageEffect } from 'store/effects';
import { getExchangeKey } from 'store/utils';

type CurrencyPair = {
	base: CurrencyKey | null;
	quote: CurrencyKey | null;
};

export const currencyPairState = atom<CurrencyPair>({
	key: getExchangeKey('currencyPair'),
	default: {
		base: null,
		quote: Synths.sUSD,
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
