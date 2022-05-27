// TODO: This file is meant to create a state layer for the futures page.
// It aims to do the following:
// - Prevent multiple requests for the same futures data.
// - Enable updating the futures page state without network refetches (optimistic updates).
// - Enable creating mobile versions of components with the same data.

import { atom } from 'recoil';
import { getFuturesKey } from 'store/utils';
import { FuturesPosition } from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';

export const currentMarketState = atom<string | null>({
	key: getFuturesKey('currentMarket'),
	default: null,
});

export const positionState = atom<FuturesPosition | null>({
	key: getFuturesKey('position'),
	default: null,
});

export const tradeSizeState = atom({
	key: getFuturesKey('tradeSize'),
	default: '',
});

export const tradeSizeSUSDState = atom({
	key: getFuturesKey('tradeSizeSUSD'),
	default: '',
});

export const positionSideState = atom<PositionSide>({
	key: getFuturesKey('positionSide'),
	default: PositionSide.LONG,
});
