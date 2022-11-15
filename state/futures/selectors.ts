import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'state/store';

import { MarketKeyByAsset } from 'utils/futures';

export const selectMarketKey = createSelector(
	(state: RootState) => state.futures.marketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);
