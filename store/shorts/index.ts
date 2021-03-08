import { HistoricalShortPosition } from 'queries/collateral/subgraph/types';
import { atom } from 'recoil';

import { getShortsKey } from '../utils';

export const historicalShortsPositionState = atom<HistoricalShortPosition[]>({
	key: getShortsKey('shorts'),
	default: [],
});
