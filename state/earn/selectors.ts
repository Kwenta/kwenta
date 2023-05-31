import { createSelector } from '@reduxjs/toolkit';

import { PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { toWei, truncateNumbers, zeroBN } from 'sdk/utils/number';
import { RootState } from 'state/store';

export const selectBalance = createSelector((state: RootState) => state.earn.balance, toWei);

export const selectLpTokenBalance = createSelector(
	(state: RootState) => state.earn.lpTokenBalance,
	toWei
);

export const selectIsApproved = createSelector(
	(state: RootState) => state.earn.allowance,
	selectLpTokenBalance,
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

export const selectKwentaAmount = createSelector(
	(state: RootState) => state.earn.kwentaAmount,
	toWei
);

export const selectKwentaPrice = createSelector(
	(state: RootState) => state.earn.kwentaPrice,
	toWei
);

export const selectWethAmount = createSelector((state: RootState) => state.earn.wethAmount, toWei);

export const selectWethPrice = createSelector((state: RootState) => state.earn.wethPrice, toWei);

export const selectOpPrice = createSelector((state: RootState) => state.earn.opPrice, toWei);

export const selectLpTvl = createSelector(
	selectKwentaAmount,
	selectKwentaPrice,
	selectWethAmount,
	selectWethPrice,
	(kwentaAmount, kwentaPrice, wethAmount, wethPrice) =>
		kwentaAmount.mul(kwentaPrice).add(wethAmount.mul(wethPrice))
);

export const selectLpTotalSupply = createSelector(
	(state: RootState) => state.earn.lpTotalSupply,
	toWei
);

export const selectLpTokenValue = createSelector(
	selectLpTvl,
	selectLpTotalSupply,
	(tvl, lpTotalSupply) => (lpTotalSupply.gt(0) ? tvl.div(lpTotalSupply) : zeroBN)
);

export const selectEarnApy = createSelector(
	selectLpTokenValue,
	selectKwentaPrice,
	(state: RootState) => state.earn.rewardRate,
	(state: RootState) => state.earn.totalSupply,
	(_lpTokenValue, _kwentaPrice, _rewardRate, _totalSupply) => zeroBN
);
