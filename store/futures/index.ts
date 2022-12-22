import { atom } from 'recoil';

import {
	FuturesAccountState,
	CrossMarginAccounts,
	PositionHistoryState,
	FuturesAccountTypes,
} from 'queries/futures/types';
import { Price } from 'queries/rates/types';
import { getFuturesKey } from 'store/utils';
import { zeroBN } from 'utils/formatters/number';

export const activeTabState = atom<number>({
	key: getFuturesKey('activeTab'),
	default: 0,
});

export const positionHistoryState = atom<PositionHistoryState>({
	key: getFuturesKey('positionHistory'),
	default: {
		[FuturesAccountTypes.CROSS_MARGIN]: [],
		[FuturesAccountTypes.ISOLATED_MARGIN]: [],
	},
});

export const pastRatesState = atom<Price[]>({
	key: getFuturesKey('pastRates'),
	default: [],
});

export const orderFeeCapState = atom({
	key: getFuturesKey('orderFeeCapState'),
	default: zeroBN,
});

export const futuresAccountState = atom<FuturesAccountState>({
	key: getFuturesKey('futuresAccountState'),
	default: {
		crossMarginAddress: null,
		walletAddress: null,
		crossMarginAvailable: false,
		status: 'initial-fetch',
	},
});

export const crossMarginAccountsState = atom<CrossMarginAccounts>({
	key: getFuturesKey('crossMarginAccounts'),
	default: {},
});

export const showCrossMarginOnboardState = atom({
	key: getFuturesKey('showCrossMarginOnboard'),
	default: false,
});
