import { ZERO_WEI } from '@kwenta/sdk/constants'
import { TransactionStatus } from '@kwenta/sdk/types'
import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { STAKING_DISABLED } from 'constants/ui'
import { getApy, getEpochDetails, parseEpochData } from 'queries/staking/utils'
import {
	selectInMigrationPeriod,
	selectIsMigrationPeriodStarted,
	selectNeedEscrowMigratorApproval,
	selectNumberOfUnmigratedRegisteredEntries,
	selectNumberOfUnregisteredEntries,
	selectNumberOfUnvestedRegisteredEntries,
	selectStartMigration,
} from 'state/stakingMigration/selectors'
import { RootState } from 'state/store'
import { FetchStatus } from 'state/types'

export const selectSubmittingStakingTx = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (
			app.transaction?.status === TransactionStatus.AwaitingExecution ||
			app.transaction?.status === TransactionStatus.Executed
		)
	}
)

export const selectClaimableBalanceV1 = createSelector(
	(state: RootState) => state.staking.v1.claimableBalance,
	toWei
)

const selectClaimableBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.claimableBalance,
	toWei
)

export const selectStakedKwentaBalanceV1 = createSelector(
	(state: RootState) => state.staking.v1.stakedKwentaBalance,
	toWei
)

const selectStakedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.stakedKwentaBalance,
	toWei
)

const selectEscrowedKwentaBalanceV1 = createSelector(
	(state: RootState) => state.staking.v1.escrowedKwentaBalance,
	toWei
)

const selectEscrowedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.escrowedKwentaBalance,
	toWei
)

const selectStakedEscrowedKwentaBalanceV1 = createSelector(
	(state: RootState) => state.staking.v1.stakedEscrowedKwentaBalance,
	toWei
)

const selectStakedEscrowedKwentaBalanceV2 = createSelector(
	(state: RootState) => state.staking.v2.stakedEscrowedKwentaBalance,
	toWei
)

export const selectTotalVestableV1 = createSelector(
	(state: RootState) => state.staking.v1.totalVestable,
	wei
)

const selectTotalVestableV2 = createSelector(
	(state: RootState) => state.staking.v2.totalVestable,
	wei
)

export const selectStakingMigrationRequired = createSelector(
	selectClaimableBalanceV1,
	selectStakedKwentaBalanceV1,
	selectTotalVestableV1,
	(claimableBalanceV1, stakedKwentaBalanceV1, totalVestableV1) =>
		claimableBalanceV1.gt(ZERO_WEI) ||
		stakedKwentaBalanceV1.gt(ZERO_WEI) ||
		totalVestableV1.gt(ZERO_WEI)
)

export const selectStakingV1 = createSelector(
	selectStakingMigrationRequired,
	selectStartMigration,
	(stakingMigrationRequired, startMigration) => stakingMigrationRequired || startMigration
)

export const selectKwentaBalance = createSelector(
	(state: RootState) => state.staking.kwentaBalance,
	toWei
)

export const selectClaimableBalance = createSelector(
	selectClaimableBalanceV1,
	selectClaimableBalanceV2,
	selectStakingV1,
	(claimableBalanceV1, claimableBalanceV2, stakingV1) =>
		stakingV1 ? claimableBalanceV1 : claimableBalanceV2
)

export const selectStakedKwentaBalance = createSelector(
	selectStakedKwentaBalanceV1,
	selectStakedKwentaBalanceV2,
	selectStakingV1,
	(stakedKwentaBalanceV1, stakedKwentaBalanceV2, stakingV1) =>
		stakingV1 ? stakedKwentaBalanceV1 : stakedKwentaBalanceV2
)

export const selectEscrowedKwentaBalance = createSelector(
	selectEscrowedKwentaBalanceV1,
	selectEscrowedKwentaBalanceV2,
	selectStakingV1,
	(escrowedKwentaBalanceV1, escrowedKwentaBalanceV2, stakingV1) =>
		stakingV1 ? escrowedKwentaBalanceV1 : escrowedKwentaBalanceV2
)

export const selectStakedEscrowedKwentaBalance = createSelector(
	selectStakedEscrowedKwentaBalanceV1,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakingV1,
	(stakedEscrowedKwentaBalanceV1, stakedEscrowedKwentaBalanceV2, stakingV1) =>
		stakingV1 ? stakedEscrowedKwentaBalanceV1 : stakedEscrowedKwentaBalanceV2
)

export const selectTotalVestable = createSelector(
	selectTotalVestableV1,
	selectTotalVestableV2,
	selectStakingV1,
	(totalVestableV1, totalVestableV2, stakingV1) => (stakingV1 ? totalVestableV1 : totalVestableV2)
)

export const selectUnstakedEscrowedKwentaBalance = createSelector(
	selectEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalance,
	(escrowedKwentaBalance, stakedEscrowedKwentaBalance) => {
		return escrowedKwentaBalance.sub(stakedEscrowedKwentaBalance)
	}
)

const selectIsKwentaTokenApprovedV1 = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaAllowance,
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
)
const selectIsKwentaTokenApprovedV2 = createSelector(
	selectKwentaBalance,
	(state: RootState) => state.staking.kwentaStakingV2Allowance,
	(kwentaBalance, kwentaAllowance) => kwentaBalance.lte(kwentaAllowance)
)

export const selectIsKwentaTokenApproved = createSelector(
	selectIsKwentaTokenApprovedV1,
	selectIsKwentaTokenApprovedV2,
	selectStakingV1,
	(isKwentaTokenApprovedV1, isKwentaTokenApprovedV2, stakingV1) =>
		stakingV1 ? isKwentaTokenApprovedV1 : isKwentaTokenApprovedV2
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

export const selectIsTimeLeftInCooldown = createSelector(
	selectStakedResetTime,
	(stakedResetTime) => stakedResetTime > Date.now() / 1000
)

export const selectCanStakeKwenta = createSelector(
	selectKwentaBalance,
	selectIsStakingKwenta,
	(kwentaBalance, isStakingKwenta) => kwentaBalance.gt(0) && !isStakingKwenta && !STAKING_DISABLED
)

const selectCanUnstakeKwentaV1 = createSelector(
	selectStakedKwentaBalanceV1,
	selectIsUnstakingKwenta,
	(stakedKwentaBalance, isUnstakingKwenta) =>
		stakedKwentaBalance.gt(0) && !isUnstakingKwenta && !STAKING_DISABLED
)

const selectCanUnstakeKwentaV2 = createSelector(
	selectStakedKwentaBalanceV2,
	selectIsUnstakingKwenta,
	selectIsTimeLeftInCooldown,
	(stakedKwentaBalance, isUnstakingKwenta, isTimeLeftInCooldown) =>
		stakedKwentaBalance.gt(0) && !isUnstakingKwenta && !isTimeLeftInCooldown && !STAKING_DISABLED
)

export const selectCanUnstakeKwenta = createSelector(
	selectCanUnstakeKwentaV1,
	selectCanUnstakeKwentaV2,
	selectStakingV1,
	(canUnstakeKwentaV1, canUnstakeKwentaV2, stakingV1) =>
		stakingV1 ? canUnstakeKwentaV1 : canUnstakeKwentaV2
)

const selectCanUnstakeEscrowedKwentaV1 = createSelector(
	selectStakedEscrowedKwentaBalance,
	selectIsUnstakingEscrowedKwenta,
	(stakedEscrowedKwentaBalance, isUnstakingEscrowedKwenta) => {
		return stakedEscrowedKwentaBalance.gt(0) && !isUnstakingEscrowedKwenta && !STAKING_DISABLED
	}
)

const selectCanUnstakeEscrowedKwentaV2 = createSelector(
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

export const selectCanUnstakeEscrowedKwenta = createSelector(
	selectCanUnstakeEscrowedKwentaV1,
	selectCanUnstakeEscrowedKwentaV2,
	selectStakingV1,
	(canUnstakeEscrowedKwentaV1, canUnstakeEscrowedKwentaV2, stakingV1) =>
		stakingV1 ? canUnstakeEscrowedKwentaV1 : canUnstakeEscrowedKwentaV2
)

export const selectCanStakeEscrowedKwenta = createSelector(
	selectUnstakedEscrowedKwentaBalance,
	selectIsStakingEscrowedKwenta,
	(unstakedEscrowedKwentaBalance, isStakingEscrowedKwenta) => {
		return unstakedEscrowedKwentaBalance.gt(0) && !isStakingEscrowedKwenta && !STAKING_DISABLED
	}
)

export const selectEpochPeriod = createSelector(
	(state: RootState) => state.staking.epochPeriod,
	wei
)

const selectApyV1 = createSelector(
	(state: RootState) => state.staking.v1.totalStakedBalance,
	(state: RootState) => state.staking.weekCounter,
	(totalStakedBalance, weekCounter) => {
		return getApy(Number(totalStakedBalance), weekCounter)
	}
)

const selectApyV2 = createSelector(
	(state: RootState) => state.staking.v2.totalStakedBalance,
	(state: RootState) => state.staking.weekCounter,
	(totalStakedBalance, weekCounter) => {
		return getApy(Number(totalStakedBalance), weekCounter)
	}
)

export const selectApy = createSelector(
	selectApyV1,
	selectApyV2,
	selectStakingV1,
	(apyV1, apyV2, stakingV1) => (stakingV1 ? apyV1 : apyV2)
)

const selectEscrowEntriesV1 = (state: RootState) => state.staking.v1.escrowData ?? []

const selectEscrowEntriesV2 = (state: RootState) => state.staking.v2.escrowData ?? []

export const selectEscrowEntries = createSelector(
	selectEscrowEntriesV1,
	selectEscrowEntriesV2,
	selectStakingV1,
	(escrowEntriesV1, escrowEntriesV2, stakingV1) => (stakingV1 ? escrowEntriesV1 : escrowEntriesV2)
)

export const selectIsClaimingAllRewards = createSelector(
	(state: RootState) => state.staking.claimAllRewardsStatus,
	(claimAllRewardsStatus) => claimAllRewardsStatus === FetchStatus.Loading
)

export const selectCanVestBeforeMigration = createSelector(
	selectStakingV1,
	selectStartMigration,
	(stakingV1, startMigration) => stakingV1 && !startMigration
)

export const selectTradingRewardsSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10

export const selectStakingSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10 || state.wallet.networkId === 420

export const selectStepClaimActive = createSelector(selectClaimableBalanceV1, (claimableBalance) =>
	claimableBalance.gt(0)
)

export const selectStepClaimTradingActive = createSelector(
	selectStepClaimActive,
	selectKwentaRewards,
	(stepClaimActive, kwentaRewards) => !stepClaimActive && kwentaRewards.gt(0)
)

export const selectStepClaimFlowActive = createSelector(
	selectStepClaimActive,
	selectStepClaimTradingActive,
	(stepClaim, stepClaimTrading) => stepClaim || stepClaimTrading
)

export const selectStepRegisterActive = createSelector(
	selectNumberOfUnregisteredEntries,
	(numberOfUnregisteredEntries) => numberOfUnregisteredEntries > 0
)

export const selectStepVestActive = createSelector(
	selectStepRegisterActive,
	selectNumberOfUnvestedRegisteredEntries,
	(stepRegisterActive, numberOfUnvestedEntries) =>
		!stepRegisterActive && numberOfUnvestedEntries > 0
)

export const selectStepApproveActive = createSelector(
	selectStepRegisterActive,
	selectStepVestActive,
	selectNeedEscrowMigratorApproval,
	(stepRegisterActive, stepVestActive, needApproval) =>
		!stepRegisterActive && !stepVestActive && needApproval
)

export const selectStepMigrateActive = createSelector(
	selectStepRegisterActive,
	selectStepVestActive,
	selectStepApproveActive,
	selectNumberOfUnmigratedRegisteredEntries,
	(stepRegisterActive, stepVestActive, stepApproveActive, numberOfUnmigratedEntries) =>
		!stepRegisterActive && !stepVestActive && !stepApproveActive && numberOfUnmigratedEntries > 0
)

export const selectStepMigrateFlowActive = createSelector(
	selectStepClaimFlowActive,
	selectStepRegisterActive,
	selectStepVestActive,
	selectStepApproveActive,
	selectStepMigrateActive,
	selectIsMigrationPeriodStarted,
	selectInMigrationPeriod,
	(
		stepClaimFlowActive,
		stepRegisterActive,
		stepVestActive,
		stepApproveActive,
		selectStepMigrateActive,
		isMigrationPeriodStarted,
		inMigrationPeriod
	) =>
		!stepClaimFlowActive &&
		(stepRegisterActive || stepVestActive || stepApproveActive || selectStepMigrateActive) &&
		(!isMigrationPeriodStarted || inMigrationPeriod)
)

export const selectStepUnstakeActive = createSelector(
	selectStepClaimFlowActive,
	selectStepMigrateFlowActive,
	selectStakedKwentaBalanceV1,
	(stepClaimFlowActive, stepMigrateFlowActive, stakedKwentaBalance) =>
		!stepClaimFlowActive && !stepMigrateFlowActive && stakedKwentaBalance.gt(0)
)

export const selectApprovedOperators = createSelector(
	(state: RootState) => state.staking.approvedOperators,
	(approvedOperators) => approvedOperators.map((operator) => ({ address: operator }))
)

export const selectIsApprovingOperator = createSelector(
	selectSubmittingStakingTx,
	(state: RootState) => state.app,
	(submitting, app) => submitting && app.transaction?.type === 'approve_operator'
)
