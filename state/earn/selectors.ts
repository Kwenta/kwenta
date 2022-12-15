import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { RootState } from 'state/store';
import { truncateNumbers } from 'utils/formatters/number';

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

export const selectYieldPerDay = createSelector(
	(state: RootState) => state.earn.balance,
	(state: RootState) => state.earn.rewardRate,
	(state: RootState) => state.earn.totalSupply,
	(balance, rewardRate, totalSupply) => {
		const rawYield = wei(totalSupply).gt(0)
			? wei(balance).mul(rewardRate).div(totalSupply).mul(PERIOD_IN_SECONDS.ONE_DAY)
			: wei(0);

		return truncateNumbers(rawYield.toString(), 4);
	}
);
