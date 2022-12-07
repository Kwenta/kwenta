import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { getEpochDetails, parseEpochData } from 'queries/staking/utils';
import { RootState } from 'state/store';
import { FetchStatus } from 'state/types';
import { toWei } from 'utils/formatters/number';

export const selectKwentaBalance = createSelector(
	(state: RootState) => state.staking.kwentaBalance,
	toWei
);

export const selectVKwentaBalance = createSelector(
	(state: RootState) => state.staking.vKwentaBalance,
	toWei
);

export const selectVeKwentaBalance = createSelector(
	(state: RootState) => state.staking.veKwentaBalance,
	toWei
);

export const selectEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.escrowedKwentaBalance,
	toWei
);

export const selectStakedEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.stakedEscrowedKwentaBalance,
	toWei
);

export const selectStakedKwentaBalance = createSelector(
	(state: RootState) => state.staking.stakedKwentaBalance,
	toWei
);

export const selectUnstakedEscrowedKwentaBalance = createSelector(
	selectEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalance,
	(escrowedKwentaBalance, stakedEscrowedKwentaBalance) => {
		return escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance);
	}
);

export const selectClaimableBalance = createSelector(
	(state: RootState) => state.staking.claimableBalance,
	toWei
);

export const selectPeriods = createSelector(
	(state: RootState) => state.staking.epochPeriod,
	(epochPeriod) => Array.from(new Array(epochPeriod + 1), (_, i) => i + 1)
);

export const selectIsKwentaTokenApproved = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaAllowance,
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
);

export const selectIsVKwentaTokenApproved = createSelector(
	selectVKwentaBalance,
	(state: RootState) => state.staking.vKwentaAllowance,
	(vKwentaBalance, vKwentaAllowance) => vKwentaBalance.lte(vKwentaAllowance)
);

export const selectIsVeKwentaTokenApproved = createSelector(
	selectVeKwentaBalance,
	(state: RootState) => state.staking.veKwentaAllowance,
	(veKwentaBalance, veKwentaAllowance) => veKwentaBalance.lte(veKwentaAllowance)
);

export const selectResetTime = createSelector(
	(state: RootState) => state.wallet.networkId,
	(state: RootState) => state.staking.epochPeriod,
	(networkId, epochPeriod) => {
		const { epochEnd } = getEpochDetails(networkId ?? 10, epochPeriod);
		return epochEnd;
	}
);

export const selectEpochData = createSelector(
	selectPeriods,
	(state: RootState) => state.wallet.networkId,
	(periods, networkId) => periods.map((i) => parseEpochData(i, networkId))
);

export const selectSelectedEpoch = createSelector(
	(state: RootState) => state.staking.selectedEpoch,
	(state: RootState) => state.staking.epochPeriod,
	(state: RootState) => state.wallet.networkId,
	(selectedEpoch, epochPeriod, networkId) => parseEpochData(selectedEpoch ?? epochPeriod, networkId)
);

export const selectIsStakingKwenta = createSelector(
	(state: RootState) => state.staking.stakeStatus,
	(stakeStatus) => stakeStatus === FetchStatus.Loading
);

export const selectIsUnstakingKwenta = createSelector(
	(state: RootState) => state.staking.unstakeStatus,
	(unstakeStatus) => unstakeStatus === FetchStatus.Loading
);

export const selectIsStakingEscrowedKwenta = createSelector(
	(state: RootState) => state.staking.stakeEscrowedStatus,
	(stakeEscrowedStatus) => stakeEscrowedStatus === FetchStatus.Loading
);

export const selectIsUnstakingEscrowedKwenta = createSelector(
	(state: RootState) => state.staking.unstakeEscrowedStatus,
	(unstakeEscrowedStatus) => unstakeEscrowedStatus === FetchStatus.Loading
);

export const selectIsGettingReward = createSelector(
	(state: RootState) => state.staking.getRewardStatus,
	(getRewardStatus) => getRewardStatus === FetchStatus.Loading
);

export const selectIsClaimingRewards = createSelector(
	(state: RootState) => state.staking.claimRewardsStatus,
	(claimRewardsStatus) => claimRewardsStatus === FetchStatus.Loading
);

export const selectIsVestingEscrowedRewards = createSelector(
	(state: RootState) => state.staking.vestEscrowedRewardsStatus,
	(vestEscrowedRewardsStatus) => vestEscrowedRewardsStatus === FetchStatus.Loading
);

export const selectTotalRewards = createSelector(
	(state: RootState) => state.staking.totalRewards,
	wei
);

export const selectTotalVestable = createSelector(
	(state: RootState) => state.staking.totalVestable,
	wei
);

export const selectCanStakeEscrowedKwenta = createSelector(
	selectUnstakedEscrowedKwentaBalance,
	selectIsStakingEscrowedKwenta,
	(unstakedEscrowedKwentaBalance, isStakingEscrowedKwenta) => {
		return unstakedEscrowedKwentaBalance.gt(0) && !isStakingEscrowedKwenta;
	}
);

export const selectCanUnstakeEscrowedKwenta = createSelector(
	selectStakedEscrowedKwentaBalance,
	selectIsUnstakingEscrowedKwenta,
	(stakedEscrowedKwentaBalance, isUnstakingEscrowedKwenta) => {
		return stakedEscrowedKwentaBalance.gt(0) && !isUnstakingEscrowedKwenta;
	}
);
