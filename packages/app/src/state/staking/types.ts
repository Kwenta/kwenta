import { EscrowData, ClaimParams } from '@kwenta/sdk/types'

import { FetchStatus } from 'state/types'

export type StakingState = {
	kwentaBalance: string
	vKwentaBalance: string
	veKwentaBalance: string
	escrowedKwentaBalance: string
	escrowedKwentaBalanceV2: string
	claimableBalance: string
	claimableBalanceV2: string
	totalStakedBalance: string
	totalStakedBalanceV2: string
	stakedResetTime: number
	stakedEscrowedKwentaBalance: string
	stakedEscrowedKwentaBalanceV2: string
	stakedKwentaBalance: string
	stakedKwentaBalanceV2: string
	epochPeriod: number
	weekCounter: number
	kwentaAllowance: string
	vKwentaAllowance: string
	veKwentaAllowance: string
	kwentaStakingV2Allowance: string
	totalVestable: string
	totalVestableV2: string
	escrowData: EscrowData<string>[]
	escrowV2Data: EscrowData<string>[]
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
}
