import { createSelector } from '@reduxjs/toolkit';
import { toWei } from 'state/exchange/selectors';
import type { RootState } from 'state/store';

export const selectTotalUSDBalanceWei = createSelector(
	(state: RootState) => state.balances.totalUSDBalance,
	(totalUSDBalance) => toWei(totalUSDBalance)
);
