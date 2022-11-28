import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from 'state/store';
import { FetchStatus } from 'state/types';
import { toWei } from 'utils/formatters/number';

export const selectTotalUSDBalanceWei = createSelector(
	(state: RootState) => state.balances.totalUSDBalance,
	(totalUSDBalance) => toWei(totalUSDBalance)
);

export const selectSynthBalancesLoading = createSelector(
	(state: RootState) => state.balances.status,
	(status) => status === FetchStatus.Loading
);

export const selectSusdBalanceWei = createSelector(
	(state: RootState) => state.balances.susdWalletBalance,
	(susdWalletBalance) => toWei(susdWalletBalance)
);
