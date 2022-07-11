// This file should contain the state requirements for the exchange view.
// It should simplify sharing states between mobile/desktop and simple/advanced
// versions of the exchange screen (synthswap).

import { atom } from 'recoil';
import { Synths, CurrencyKey } from 'constants/currency';

export const base = atom<CurrencyKey>({
	default: Synths.sUSD,
	key: '',
});

export const quote = atom<CurrencyKey | undefined>({
	default: undefined,
	key: '',
});
