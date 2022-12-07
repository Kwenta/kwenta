import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { RootState } from 'state/store';

export const selectBalance = createSelector((state: RootState) => state.earn.balance, wei);

export const selectLPTokenBalance = createSelector(
	(state: RootState) => state.earn.lpTokenBalance,
	wei
);

export const selectIsApproved = createSelector(
	(state: RootState) => state.earn.allowance,
	selectLPTokenBalance,
	(allowance, lpTokenBalance) => {
		return lpTokenBalance.lte(allowance);
	}
);
