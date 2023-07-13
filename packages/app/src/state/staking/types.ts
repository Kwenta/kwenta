import { EscrowData, ClaimParams } from '@kwenta/sdk/types'

import { FetchStatus } from 'state/types'

export type VersionedStakeData = {
	escrowedKwentaBalance: string
	claimableBalance: string
	totalStakedBalance: string
	stakedEscrowedKwentaBalance: string
	stakedKwentaBalance: string
	totalVestable: string
	escrowData: EscrowData<string>[]
}

export type StakingState = {
	kwentaBalance: string
	vKwentaBalance: string
	veKwentaBalance: string
	v1: VersionedStakeData
	v2: VersionedStakeData
	stakedResetTime: number
	epochPeriod: number
	weekCounter: number
	selectedEscrowVersion: 1 | 2
	kwentaAllowance: string
	vKwentaAllowance: string
	veKwentaAllowance: string
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
