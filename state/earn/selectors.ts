import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { RootState } from 'state/store';
import { toWei } from 'utils/formatters/number';

export const selectIsApproved = createSelector(
	(state: RootState) => state.earn.allowance,
	(state: RootState) => state.earn.amount,
	(allowance, amount) => {
		return toWei(amount).lte(allowance);
	}
);

export const selectLPTokenBalance = createSelector(
	(state: RootState) => state.earn.lpTokenBalance,
	wei
);

export const selectBalance = createSelector((state: RootState) => state.earn.balance, wei);
