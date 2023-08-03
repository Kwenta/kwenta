import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state/store'
import { unserializeV2Markets } from 'utils/futures'

export const selectOptimismMarkets = createSelector(
	(state: RootState) => state.home.optimismMarkets,
	(optimismMarkets) => unserializeV2Markets(optimismMarkets)
)
