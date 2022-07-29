import { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { atom, selector } from 'recoil';

import { Synths, CurrencyKey, CRYPTO_CURRENCY_MAP, ATOMIC_EXCHANGES_L1 } from 'constants/currency';
import { SwapRatio } from 'hooks/useExchange';
import { localStorageEffect } from 'store/effects';
import { getExchangeKey } from 'store/utils';
import { isL2State } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';

type CurrencyPair = {
	base: CurrencyKey | null;
	quote: CurrencyKey | null;
};

export const currencyPairState = atom<CurrencyPair>({
	key: getExchangeKey('currencyPair'),
	default: { base: null, quote: Synths.sUSD },
	effects: [localStorageEffect('exchange/currencyPair')],
});

export const baseCurrencyKeyState = selector<CurrencyKey | null>({
	key: getExchangeKey('baseCurrencyKey'),
	get: ({ get }) => {
		return get(currencyPairState).base;
	},
});

export const quoteCurrencyKeyState = selector({
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
		return baseCurrencyKey ? ethersUtils.formatBytes32String(baseCurrencyKey) : null;
	},
});

export const sourceCurrencyKeyState = selector({
	key: getExchangeKey('sourceCurrencyKey'),
	get: ({ get }) => {
		const quoteCurrencyKey = get(quoteCurrencyKeyState);
		return quoteCurrencyKey ? ethersUtils.formatBytes32String(quoteCurrencyKey) : null;
	},
});

export const quoteCurrencyAmountWeiState = selector({
	key: getExchangeKey('quoteCurrencyAmountWei'),
	get: ({ get }) => {
		const quoteCurrencyAmount = get(quoteCurrencyAmountState);
		return !quoteCurrencyAmount ? zeroBN : wei(quoteCurrencyAmount);
	},
});

export const baseCurrencyAmountWeiState = selector({
	key: getExchangeKey('baseCurrencyAmountWei'),
	get: ({ get }) => {
		const baseCurrencyAmount = get(baseCurrencyAmountState);
		return !baseCurrencyAmount ? zeroBN : wei(baseCurrencyAmount);
	},
});

export const isAtomicState = selector({
	key: getExchangeKey('isAtomic'),
	get: ({ get }) => {
		const isL2 = get(isL2State);
		const baseCurrencyKey = get(baseCurrencyKeyState);
		const quoteCurrencyKey = get(quoteCurrencyKeyState);

		if (isL2 || !baseCurrencyKey || !quoteCurrencyKey) {
			return false;
		}

		return [baseCurrencyKey, quoteCurrencyKey].every((currency) =>
			ATOMIC_EXCHANGES_L1.includes(currency)
		);
	},
});
