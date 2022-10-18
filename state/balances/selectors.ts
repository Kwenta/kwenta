import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from 'state/store';

import { toWei } from 'utils/formatters/number';

export const selectTotalUSDBalanceWei = createSelector(
	(state: RootState) => state.balances.totalUSDBalance,
	(totalUSDBalance) => toWei(totalUSDBalance)
);
