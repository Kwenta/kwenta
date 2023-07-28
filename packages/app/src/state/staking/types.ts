import { EscrowData, ClaimParams } from '@kwenta/sdk/types'

import { FetchStatus } from 'state/types'

type StakeBalance = {
	escrowedKwentaBalance: string
	stakedKwentaBalance: string
	totalStakedBalance: string
	claimableBalance: string
	stakedEscrowedKwentaBalance: string
}

type EscrowBalance = {
	totalVestable: string
	escrowData: EscrowData<string>[]
}

type StakingTransaction = {
	kwentaBalance: string
	kwentaAllowance: string
	epochPeriod: number
	weekCounter: number
}

type StakingTransactionV2 = {
	stakedResetTime: number
	kwentaStakingV2Allowance: string
}

export type VersionedStakeData = StakeBalance & EscrowBalance

export type StakingState = StakingTransaction & {
	v1: VersionedStakeData
	v2: VersionedStakeData
	stakedResetTime: number
	selectedEscrowVersion: 1 | 2
	kwentaStakingV2Allowance: string
	kwentaRewards: string
	opRewards: string
	snxOpRewards: string
	estimatedKwentaRewards: string
	estimatedOpRewards: string
	claimableKwentaRewards: ClaimParams[][]
	claimableOpRewards: ClaimParams[]
	claimableSnxOpRewards: ClaimParams[]
	selectedEpoch?: number
	stakingMigrationCompleted: boolean
	stakeStatus: FetchStatus
	unstakeStatus: FetchStatus
	stakeEscrowedStatus: FetchStatus
	unstakeEscrowedStatus: FetchStatus
	getRewardStatus: FetchStatus
	claimKwentaRewardsStatus: FetchStatus
	claimOpRewardsStatus: FetchStatus
	claimSnxOpRewardsStatus: FetchStatus
	claimAllRewardsStatus: FetchStatus
	vestEscrowedRewardsStatus: FetchStatus
	approveKwentaStatus: FetchStatus
	compoundRewardsStatus: FetchStatus
}

export type StakingAction = StakeBalance & StakingTransaction

export type StakingActionV2 = StakeBalance & StakingTransactionV2
