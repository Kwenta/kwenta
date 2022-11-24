import { createSelector } from '@reduxjs/toolkit';

import { RootState } from 'state/store';
import { toWei } from 'utils/formatters/number';

export const selectKwentaBalance = createSelector(
	(state: RootState) => state.staking.kwentaBalance,
	(kwentaBalance) => toWei(kwentaBalance)
);
