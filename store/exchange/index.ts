import { atom } from 'recoil';

import { getExchangeKey } from 'store/utils';

export const txErrorState = atom<string | null>({
	key: getExchangeKey('txError'),
	default: null,
});
