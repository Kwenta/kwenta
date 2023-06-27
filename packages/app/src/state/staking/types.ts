import { EscrowData, ClaimParams } from '@kwenta/sdk/types'

import { FetchStatus } from 'state/types'

export type StakingState = {
	kwentaBalance: string
	vKwentaBalance: string
	veKwentaBalance: string
	escrowedKwentaBalance: string
	claimableBalance: string
	totalStakedBalance: string
	totalStakedBalanceV2: string
	stakedEscrowedKwentaBalance: string
	stakedKwentaBalance: string
	epochPeriod: number
	weekCounter: number
	kwentaAllowance: string
	vKwentaAllowance: string
	veKwentaAllowance: string
	totalVestable: string
	escrowData: EscrowData<string>[]
	kwentaRewards: string
	opRewards: string
	snxOpRewards: string
	claimableKwentaRewards: ClaimParams[][]
	claimableOpRewards: ClaimParams[]
	claimableSnxOpRewards: ClaimParams[]
	selectedEpoch?: number
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
