import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'state/store';
import { unserializeMarkets } from 'utils/futures';

export const selectOptimismMarkets = createSelector(
	(state: RootState) => state.home.optimismMarkets,
	(optimismMarkets) => unserializeMarkets(optimismMarkets)
);
