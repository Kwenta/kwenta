import { ZERO_WEI } from '@kwenta/sdk/constants'
import { EscrowData } from '@kwenta/sdk/types'
import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { STAKING_DISABLED } from 'constants/ui'
import { getApy, getEpochDetails, parseEpochData } from 'queries/staking/utils'
import { RootState } from 'state/store'
import { FetchStatus } from 'state/types'

export const selectKwentaBalance = createSelector(
	(state: RootState) => state.staking.kwentaBalance,
	toWei
)

export const selectEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.v1.escrowedKwentaBalance,
	toWei
)

export const selectEscrowedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.escrowedKwentaBalance,
	toWei
)

export const selectStakedEscrowedKwentaBalance = createSelector(
	(state: RootState) => state.staking.v1.stakedEscrowedKwentaBalance,
	toWei
)

export const selectStakedEscrowedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.stakedEscrowedKwentaBalance,
	toWei
)

export const selectStakedKwentaBalance = createSelector(
	(state: RootState) => state.staking.v1.stakedKwentaBalance,
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
	(state: RootState) => state.staking.v1.claimableBalance,
	toWei
)

export const selectStakedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.stakedKwentaBalance,
	toWei
)

export const selectClaimableBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.claimableBalance,
	toWei
)

export const selectIsKwentaTokenApproved = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaAllowance,
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
)

export const selectIsKwentaTokenApprovedV2 = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaStakingV2Allowance,
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

export const selectIsApprovingKwenta = createSelector(
	(state: RootState) => state.staking.approveKwentaStatus,
	(approveKwentaStatus) => approveKwentaStatus === FetchStatus.Loading
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

export const selectIsCompoundingRewards = createSelector(
	(state: RootState) => state.staking.compoundRewardsStatus,
	(compoundRewardsStatus) => compoundRewardsStatus === FetchStatus.Loading
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
	(state: RootState) => state.staking.v1.totalVestable,
	wei
)

export const selectTotalVestableV2 = createSelector(
	(state: RootState) => state.staking.v2.totalVestable,
	wei
)

export const selectIsTimeLeftInCooldown = createSelector(
	selectStakedResetTime,
	(stakedResetTime) => stakedResetTime > new Date().getTime() / 1000
)

export const selectCanStakeKwenta = createSelector(
	selectKwentaBalance,
	selectIsStakingKwenta,
	(kwentaBalance, isStakingKwenta) => kwentaBalance.gt(0) && !isStakingKwenta && !STAKING_DISABLED
)

export const selectCanUnstakeKwentaV2 = createSelector(
	selectStakedKwentaBalanceV2,
	selectIsUnstakingKwenta,
	selectIsTimeLeftInCooldown,
	(stakedKwentaBalance, isUnstakingKwenta, isTimeLeftInCooldown) =>
		stakedKwentaBalance.gt(0) && !isUnstakingKwenta && !isTimeLeftInCooldown && !STAKING_DISABLED
)

export const selectCanUnstakeKwenta = createSelector(
	selectStakedKwentaBalance,
	selectIsUnstakingKwenta,
	(stakedKwentaBalance, isUnstakingKwenta) =>
		stakedKwentaBalance.gt(0) && !isUnstakingKwenta && !STAKING_DISABLED
)

export const selectCanStakeEscrowedKwenta = createSelector(
	selectUnstakedEscrowedKwentaBalance,
	selectIsStakingEscrowedKwenta,
	(unstakedEscrowedKwentaBalance, isStakingEscrowedKwenta) => {
		return unstakedEscrowedKwentaBalance.gt(0) && !isStakingEscrowedKwenta && !STAKING_DISABLED
	}
)

export const selectCanUnstakeEscrowedKwenta = createSelector(
	selectStakedEscrowedKwentaBalance,
	selectIsUnstakingEscrowedKwenta,
	(stakedEscrowedKwentaBalance, isUnstakingEscrowedKwenta) => {
		return stakedEscrowedKwentaBalance.gt(0) && !isUnstakingEscrowedKwenta && !STAKING_DISABLED
	}
)

export const selectCanUnstakeEscrowedKwentaV2 = createSelector(
	selectStakedEscrowedKwentaBalanceV2,
	selectIsUnstakingEscrowedKwenta,
	selectIsTimeLeftInCooldown,
	(stakedEscrowedKwentaBalance, isUnstakingEscrowedKwenta, isTimeLeftInCooldown) => {
		return (
			stakedEscrowedKwentaBalance.gt(0) &&
			!isUnstakingEscrowedKwenta &&
			!isTimeLeftInCooldown &&
			!STAKING_DISABLED
		)
	}
)

export const selectEpochPeriod = createSelector(
	(state: RootState) => state.staking.epochPeriod,
	wei
)

export const selectAPY = createSelector(
	(state: RootState) => state.staking.v1.totalStakedBalance,
	(state: RootState) => state.staking.weekCounter,
	(totalStakedBalance, weekCounter) => {
		return getApy(Number(totalStakedBalance), weekCounter)
	}
)

export const selectAPYV2 = createSelector(
	(state: RootState) => state.staking.v2.totalStakedBalance,
	(state: RootState) => state.staking.v1.totalStakedBalance,
	(state: RootState) => state.staking.weekCounter,
	(totalStakedBalance, totalStakedBalanceV1, weekCounter) => {
		return getApy(Number(totalStakedBalance) + Number(totalStakedBalanceV1), weekCounter)
	}
)

export const selectEscrowData = (state: RootState) => state.staking.v1.escrowData ?? []

export const selectEscrowV2Data = (state: RootState) => state.staking.v2.escrowData ?? []

export const selectVestEscrowV2Entries = createSelector(selectEscrowV2Data, (escrowData) =>
	escrowData.map((entry: EscrowData<string>) => entry.id)
)

export const selectStakingRollbackRequired = createSelector(
	selectStakedKwentaBalanceV2,
	selectTotalVestableV2,
	(stakedKwentaBalance, totalVestable) =>
		stakedKwentaBalance.gt(ZERO_WEI) || totalVestable.gt(ZERO_WEI)
)

export const selectStakingMigrationCompleted = (state: RootState) =>
	state.staking.stakingMigrationCompleted

export const selectStakingMigrationRequired = createSelector(
	selectClaimableBalance,
	selectStakedKwentaBalance,
	(claimableBalanceV1, stakedKwentaBalanceV1) =>
		claimableBalanceV1.gt(ZERO_WEI) || stakedKwentaBalanceV1.gt(ZERO_WEI)
)

export const selectSelectedEscrowVersion = (state: RootState) =>
	state.staking.selectedEscrowVersion ?? 1

export const selectCombinedEscrowData = createSelector(
	selectEscrowData,
	selectEscrowV2Data,
	selectSelectedEscrowVersion,
	(escrowDataV1, escrowDataV2, escrowVersion) => (escrowVersion === 1 ? escrowDataV1 : escrowDataV2)
)

export const selectTradingRewardsSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10

export const selectStakingSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10 || state.wallet.networkId === 420

export const selectIsClaimingAllRewards = createSelector(
	(state: RootState) => state.staking.claimAllRewardsStatus,
	(claimAllRewardsStatus) => claimAllRewardsStatus === FetchStatus.Loading
)
