import { ZERO_WEI } from '@kwenta/sdk/constants'
import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { getApy, getEpochDetails, parseEpochData } from 'queries/staking/utils'
import { RootState } from 'state/store'
import { FetchStatus } from 'state/types'

export const selectKwentaBalance = createSelector(
	(state: RootState) => state.staking.kwentaBalance,
	toWei
)

export const selectVKwentaBalance = createSelector(
	(state: RootState) => state.staking.vKwentaBalance,
	toWei
)

export const selectVeKwentaBalance = createSelector(
	(state: RootState) => state.staking.veKwentaBalance,
	toWei
)

export const selectEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.escrowedKwentaBalance,
	toWei
)

export const selectEscrowedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.escrowedKwentaBalanceV2,
	toWei
)

export const selectStakedEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.stakedEscrowedKwentaBalance,
	toWei
)

export const selectStakedEscrowedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.stakedEscrowedKwentaBalanceV2,
	toWei
)

export const selectStakedKwentaBalance = createSelector(
	(state: RootState) => state.staking.stakedKwentaBalance,
	toWei
)

export const selectUnstakedEscrowedKwentaBalance = createSelector(
	selectEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalance,
	(escrowedKwentaBalance, stakedEscrowedKwentaBalance) => {
		return escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance)
	}
)

export const selectUnstakedEscrowedKwentaBalanceV2 = createSelector(
	selectEscrowedKwentaBalanceV2,
	selectStakedEscrowedKwentaBalanceV2,
	(escrowedKwentaBalance, stakedEscrowedKwentaBalance) => {
		return escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance)
	}
)

export const selectClaimableBalance = createSelector(
	(state: RootState) => state.staking.claimableBalance,
	toWei
)

export const selectStakedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.stakedKwentaBalanceV2,
	toWei
)

export const selectClaimableBalanceV2 = createSelector(
	(state: RootState) => state.staking.claimableBalanceV2,
	toWei
)

export const selectIsKwentaTokenApproved = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaAllowance,
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
)

export const selectIsVKwentaTokenApproved = createSelector(
	selectVKwentaBalance,
	(state: RootState) => state.staking.vKwentaAllowance,
	(vKwentaBalance, vKwentaAllowance) => vKwentaBalance.lte(vKwentaAllowance)
)

export const selectIsVeKwentaTokenApproved = createSelector(
	selectVeKwentaBalance,
	(state: RootState) => state.staking.veKwentaAllowance,
	(veKwentaBalance, veKwentaAllowance) => veKwentaBalance.lte(veKwentaAllowance)
)

export const selectIsKwentaTokenApprovedV2 = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaStakingV2Allowance ?? '0',
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
)

export const selectResetTime = createSelector(
	(state: RootState) => state.wallet.networkId,
	(state: RootState) => state.staking.epochPeriod,
	(networkId, epochPeriod) => {
		const { epochEnd } = getEpochDetails(networkId ?? 10, epochPeriod)
		return epochEnd
	}
)

export const selectStakedResetTime = (state: RootState) => state.staking.stakedResetTime

export const selectEpochData = createSelector(
	(state: RootState) => state.staking.epochPeriod,
	(state: RootState) => state.wallet.networkId,
	(epochPeriod, networkId) => {
		return Array.from(new Array(epochPeriod + 1), (_, i) => parseEpochData(i, networkId))
	}
)

export const selectSelectedEpoch = createSelector(
	(state: RootState) => state.staking.selectedEpoch,
	(state: RootState) => state.staking.epochPeriod,
	(state: RootState) => state.wallet.networkId,
	(selectedEpoch, epochPeriod, networkId) => parseEpochData(selectedEpoch ?? epochPeriod, networkId)
)

export const selectIsStakingKwenta = createSelector(
	(state: RootState) => state.staking.stakeStatus,
	(stakeStatus) => stakeStatus === FetchStatus.Loading
)

export const selectIsUnstakingKwenta = createSelector(
	(state: RootState) => state.staking.unstakeStatus,
	(unstakeStatus) => unstakeStatus === FetchStatus.Loading
)

export const selectIsStakedKwenta = createSelector(
	(state: RootState) => state.staking.stakeStatus,
	(stakeStatus) => stakeStatus === FetchStatus.Success || stakeStatus === FetchStatus.Error
)

export const selectIsUnstakedKwenta = createSelector(
	(state: RootState) => state.staking.unstakeStatus,
	(unstakeStatus) => unstakeStatus === FetchStatus.Success || unstakeStatus === FetchStatus.Error
)

export const selectIsStakingEscrowedKwenta = createSelector(
	(state: RootState) => state.staking.stakeEscrowedStatus,
	(stakeEscrowedStatus) => stakeEscrowedStatus === FetchStatus.Loading
)

export const selectIsUnstakingEscrowedKwenta = createSelector(
	(state: RootState) => state.staking.unstakeEscrowedStatus,
	(unstakeEscrowedStatus) => unstakeEscrowedStatus === FetchStatus.Loading
)

export const selectIsStakedEscrowedKwenta = createSelector(
	(state: RootState) => state.staking.stakeEscrowedStatus,
	(stakeEscrowedStatus) =>
		stakeEscrowedStatus === FetchStatus.Success || stakeEscrowedStatus === FetchStatus.Error
)

export const selectIsUnstakedEscrowedKwenta = createSelector(
	(state: RootState) => state.staking.unstakeEscrowedStatus,
	(unstakeEscrowedStatus) =>
		unstakeEscrowedStatus === FetchStatus.Success || unstakeEscrowedStatus === FetchStatus.Error
)

export const selectIsGettingReward = createSelector(
	(state: RootState) => state.staking.getRewardStatus,
	(getRewardStatus) => getRewardStatus === FetchStatus.Loading
)

export const selectIsClaimingRewards = createSelector(
	(state: RootState) => state.staking.claimKwentaRewardsStatus,
	(claimKwentaRewardsStatus) => claimKwentaRewardsStatus === FetchStatus.Loading
)

export const selectIsVestingEscrowedRewards = createSelector(
	(state: RootState) => state.staking.vestEscrowedRewardsStatus,
	(vestEscrowedRewardsStatus) => vestEscrowedRewardsStatus === FetchStatus.Loading
)

export const selectKwentaRewards = createSelector(
	(state: RootState) => state.staking.kwentaRewards,
	wei
)

export const selectOpRewards = createSelector((state: RootState) => state.staking.opRewards, wei)

export const selectSnxOpRewards = createSelector(
	(state: RootState) => state.staking.snxOpRewards,
	wei
)

export const selectEstimatedKwentaRewards = createSelector(
	(state: RootState) => state.staking.estimatedKwentaRewards,
	wei
)

export const selectEstimatedOpRewards = createSelector(
	(state: RootState) => state.staking.estimatedOpRewards,
	wei
)

export const selectTotalVestable = createSelector(
	(state: RootState) => state.staking.totalVestable,
	wei
)

export const selectTotalVestableV2 = createSelector(
	(state: RootState) => state.staking.totalVestableV2 ?? '0',
	wei
)

export const selectCanStakeEscrowedKwenta = createSelector(
	selectUnstakedEscrowedKwentaBalance,
	selectIsStakingEscrowedKwenta,
	(unstakedEscrowedKwentaBalance, isStakingEscrowedKwenta) => {
		return unstakedEscrowedKwentaBalance.gt(0) && !isStakingEscrowedKwenta
	}
)

export const selectCanUnstakeEscrowedKwenta = createSelector(
	selectStakedEscrowedKwentaBalance,
	selectIsUnstakingEscrowedKwenta,
	(stakedEscrowedKwentaBalance, isUnstakingEscrowedKwenta) => {
		return stakedEscrowedKwentaBalance.gt(0) && !isUnstakingEscrowedKwenta
	}
)

export const selectEpochPeriod = createSelector(
	(state: RootState) => state.staking.epochPeriod,
	wei
)

export const selectAPY = createSelector(
	(state: RootState) => state.staking.totalStakedBalance,
	(state: RootState) => state.staking.weekCounter,
	(totalStakedBalance, weekCounter) => {
		return getApy(Number(totalStakedBalance), weekCounter)
	}
)

export const selectAPYV2 = createSelector(
	(state: RootState) => state.staking.totalStakedBalanceV2,
	(state: RootState) => state.staking.weekCounter,
	(totalStakedBalance, weekCounter) => {
		return getApy(Number(totalStakedBalance), weekCounter)
	}
)

export const selectEscrowData = (state: RootState) => state.staking.escrowData ?? []

export const selectEscrowV2Data = (state: RootState) => state.staking.escrowV2Data ?? []

export const selectShowMigrationPage = createSelector(
	selectClaimableBalance,
	selectStakedKwentaBalance,
	(claimableBalanceV1, stakedKwentaBalanceV1) =>
		claimableBalanceV1.gt(ZERO_WEI) || stakedKwentaBalanceV1.gt(ZERO_WEI)
)
