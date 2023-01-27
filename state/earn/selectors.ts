import { createSelector } from '@reduxjs/toolkit';

import { PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { RootState } from 'state/store';
import { toWei, truncateNumbers, zeroBN } from 'utils/formatters/number';

export const selectBalance = createSelector((state: RootState) => state.earn.balance, toWei);

export const selectLPTokenBalance = createSelector(
	(state: RootState) => state.earn.lpTokenBalance,
	toWei
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
		const rawYield = toWei(totalSupply).gt(0)
			? toWei(balance).mul(rewardRate).div(totalSupply).mul(PERIOD_IN_SECONDS.ONE_DAY)
			: zeroBN;

		return truncateNumbers(rawYield.toString(), 4);
	}
);

export const selectEarnedRewards = createSelector(
	(state: RootState) => state.earn.earnedRewards,
	toWei
);

export const selectKwentaAmount = createSelector((state: RootState) => state.earn.amount1, toWei);

export const selectWethAmount = createSelector((state: RootState) => state.earn.amount0, toWei);

export const selectLPTotalSupply = createSelector(
	(state: RootState) => state.earn.lpTotalSupply,
	toWei
);
