import { createSlice } from '@reduxjs/toolkit'

import { FetchStatus } from 'state/types'

import {
	claimMultipleKwentaRewards,
	claimMultipleAllRewards,
	claimMultipleOpRewards,
	claimMultipleSnxOpRewards,
	fetchClaimableRewards,
	fetchEscrowData,
	fetchStakingData,
	claimStakingRewards,
	stakeEscrow,
	stakeKwenta,
	unstakeEscrow,
	unstakeKwenta,
	vestEscrowedRewards,
	fetchStakingV2Data,
	fetchEscrowV2Data,
	fetchEstimatedRewards,
	vestEscrowedRewardsV2,
	stakeKwentaV2,
	unstakeKwentaV2,
	unstakeEscrowV2,
	stakeEscrowV2,
	claimStakingRewardsV2,
	approveKwentaToken,
	compoundRewards,
} from './actions'
import { StakingState } from './types'

export const STAKING_INITIAL_STATE: StakingState = {
	kwentaBalance: '0',
	vKwentaBalance: '0',
	veKwentaBalance: '0',
	v1: {
		escrowedKwentaBalance: '0',
		claimableBalance: '0',
		totalStakedBalance: '0',
		stakedEscrowedKwentaBalance: '0',
		stakedKwentaBalance: '0',
		totalVestable: '0',
		escrowData: [],
	},
	v2: {
		escrowedKwentaBalance: '0',
		claimableBalance: '0',
		totalStakedBalance: '0',
		stakedEscrowedKwentaBalance: '0',
		stakedKwentaBalance: '0',
		totalVestable: '0',
		escrowData: [],
	},
	stakedResetTime: 0,
	epochPeriod: 0,
	weekCounter: 1,
	selectedEscrowVersion: 1,
	kwentaAllowance: '0',
	kwentaStakingV2Allowance: '0',
	vKwentaAllowance: '0',
	veKwentaAllowance: '0',
	kwentaRewards: '0',
	opRewards: '0',
	snxOpRewards: '0',
	estimatedKwentaRewards: '0',
	estimatedOpRewards: '0',
	claimableKwentaRewards: [],
	claimableOpRewards: [],
	claimableSnxOpRewards: [],
	stakeStatus: FetchStatus.Idle,
	unstakeStatus: FetchStatus.Idle,
	stakeEscrowedStatus: FetchStatus.Idle,
	unstakeEscrowedStatus: FetchStatus.Idle,
	getRewardStatus: FetchStatus.Idle,
	claimKwentaRewardsStatus: FetchStatus.Idle,
	claimOpRewardsStatus: FetchStatus.Idle,
	claimSnxOpRewardsStatus: FetchStatus.Idle,
	claimAllRewardsStatus: FetchStatus.Idle,
	vestEscrowedRewardsStatus: FetchStatus.Idle,
	approveKwentaStatus: FetchStatus.Idle,
	compoundRewardsStatus: FetchStatus.Idle,
}

const stakingSlice = createSlice({
	name: 'staking',
	initialState: STAKING_INITIAL_STATE,
	reducers: {
		setStakeStatus: (state, action) => {
			state.stakeStatus = action.payload
		},
		setUnstakeStatus: (state, action) => {
			state.unstakeStatus = action.payload
		},
		setStakeEscrowedStatus: (state, action) => {
			state.stakeEscrowedStatus = action.payload
		},
		setUnstakeEscrowedStatus: (state, action) => {
			state.unstakeEscrowedStatus = action.payload
		},
		setGetRewardStatus: (state, action) => {
			state.getRewardStatus = action.payload
		},
		setClaimAllRewardsStatus: (state, action) => {
			state.claimAllRewardsStatus = action.payload
		},
		setClaimKwentaRewardsStatus: (state, action) => {
			state.claimKwentaRewardsStatus = action.payload
		},
		setClaimOpRewardsStatus: (state, action) => {
			state.claimOpRewardsStatus = action.payload
		},
		setClaimSnxOpRewardsStatus: (state, action) => {
			state.claimSnxOpRewardsStatus = action.payload
		},
		setVestEscrowedRewardsStatus: (state, action) => {
			state.vestEscrowedRewardsStatus = action.payload
		},
		setApproveKwentaStatus: (state, action) => {
			state.approveKwentaStatus = action.payload
		},
		setCompoundRewardsStatus: (state, action) => {
			state.compoundRewardsStatus = action.payload
		},
		setSelectedEpoch: (state, action) => {
			state.selectedEpoch = action.payload
		},
		setSelectedEscrowVersion: (state, action) => {
			state.selectedEscrowVersion = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchStakingData.fulfilled, (state, action) => {
			state.v1.escrowedKwentaBalance = action.payload.rewardEscrowBalance
			state.v1.stakedKwentaBalance = action.payload.stakedNonEscrowedBalance
			state.v1.stakedEscrowedKwentaBalance = action.payload.stakedEscrowedBalance
			state.v1.claimableBalance = action.payload.claimableBalance
			state.v1.totalStakedBalance = action.payload.totalStakedBalance
			state.kwentaBalance = action.payload.kwentaBalance
			state.weekCounter = action.payload.weekCounter
			state.vKwentaBalance = action.payload.vKwentaBalance
			state.vKwentaAllowance = action.payload.vKwentaAllowance
			state.kwentaAllowance = action.payload.kwentaAllowance
			state.epochPeriod = action.payload.epochPeriod
			state.veKwentaBalance = action.payload.veKwentaBalance
			state.veKwentaAllowance = action.payload.veKwentaAllowance
			state.stakeStatus = FetchStatus.Idle
			state.unstakeStatus = FetchStatus.Idle
			state.stakeEscrowedStatus = FetchStatus.Idle
			state.unstakeEscrowedStatus = FetchStatus.Idle
			state.vestEscrowedRewardsStatus = FetchStatus.Idle
			state.getRewardStatus = FetchStatus.Idle
			state.compoundRewardsStatus = FetchStatus.Idle
			state.approveKwentaStatus = FetchStatus.Idle
		})
		builder.addCase(fetchStakingV2Data.fulfilled, (state, action) => {
			state.v2.escrowedKwentaBalance = action.payload.rewardEscrowBalance
			state.v2.stakedKwentaBalance = action.payload.stakedNonEscrowedBalance
			state.v2.stakedEscrowedKwentaBalance = action.payload.stakedEscrowedBalance
			state.v2.claimableBalance = action.payload.claimableBalance
			state.v2.totalStakedBalance = action.payload.totalStakedBalance
			state.kwentaStakingV2Allowance = action.payload.kwentaStakingV2Allowance
			state.stakedResetTime = action.payload.stakedResetTime
		})
		builder.addCase(fetchEscrowData.fulfilled, (state, action) => {
			state.v1.totalVestable = action.payload.totalVestable
			state.v1.escrowData = action.payload.escrowData
		})
		builder.addCase(fetchEscrowV2Data.fulfilled, (state, action) => {
			state.v2.totalVestable = action.payload.totalVestable
			state.v2.escrowData = action.payload.escrowData
		})
		builder.addCase(fetchClaimableRewards.fulfilled, (state, action) => {
			state.claimableKwentaRewards = action.payload.claimableKwentaRewards
			state.claimableOpRewards = action.payload.claimableOpRewards
			state.claimableSnxOpRewards = action.payload.claimableSnxOpRewards
			state.kwentaRewards = action.payload.kwentaRewards
			state.opRewards = action.payload.opRewards
			state.snxOpRewards = action.payload.snxOpRewards
			state.claimKwentaRewardsStatus = FetchStatus.Idle
			state.claimAllRewardsStatus = FetchStatus.Idle
			state.claimOpRewardsStatus = FetchStatus.Idle
			state.claimSnxOpRewardsStatus = FetchStatus.Idle
		})
		builder.addCase(fetchEstimatedRewards.fulfilled, (state, action) => {
			state.estimatedKwentaRewards = action.payload.estimatedKwentaRewards
			state.estimatedOpRewards = action.payload.estimatedOpRewards
		})
		builder.addCase(approveKwentaToken.pending, (state) => {
			state.approveKwentaStatus = FetchStatus.Loading
		})
		builder.addCase(approveKwentaToken.rejected, (state) => {
			state.approveKwentaStatus = FetchStatus.Error
		})
		builder.addCase(compoundRewards.pending, (state) => {
			state.compoundRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(compoundRewards.rejected, (state) => {
			state.compoundRewardsStatus = FetchStatus.Error
		})
		builder.addCase(stakeKwenta.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading
		})
		builder.addCase(stakeKwenta.rejected, (state) => {
			state.stakeStatus = FetchStatus.Error
		})
		builder.addCase(unstakeKwenta.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeKwenta.rejected, (state) => {
			state.unstakeStatus = FetchStatus.Error
		})
		builder.addCase(stakeEscrow.pending, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Loading
		})
		builder.addCase(stakeEscrow.rejected, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Error
		})
		builder.addCase(unstakeEscrow.pending, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeEscrow.rejected, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Error
		})
		builder.addCase(claimStakingRewards.pending, (state) => {
			state.getRewardStatus = FetchStatus.Loading
		})
		builder.addCase(claimStakingRewards.rejected, (state) => {
			state.getRewardStatus = FetchStatus.Error
		})
		builder.addCase(claimMultipleAllRewards.pending, (state) => {
			state.claimAllRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(claimMultipleAllRewards.rejected, (state) => {
			state.claimAllRewardsStatus = FetchStatus.Error
		})
		builder.addCase(claimMultipleKwentaRewards.pending, (state) => {
			state.claimKwentaRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(claimMultipleOpRewards.pending, (state) => {
			state.claimOpRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(claimMultipleSnxOpRewards.pending, (state) => {
			state.claimSnxOpRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(vestEscrowedRewards.pending, (state) => {
			state.vestEscrowedRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(vestEscrowedRewards.rejected, (state) => {
			state.vestEscrowedRewardsStatus = FetchStatus.Error
		})
		builder.addCase(vestEscrowedRewardsV2.pending, (state) => {
			state.vestEscrowedRewardsStatus = FetchStatus.Loading
		})
		builder.addCase(vestEscrowedRewardsV2.rejected, (state) => {
			state.vestEscrowedRewardsStatus = FetchStatus.Error
		})
		builder.addCase(stakeKwentaV2.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading
		})
		builder.addCase(stakeKwentaV2.rejected, (state) => {
			state.stakeStatus = FetchStatus.Error
		})
		builder.addCase(unstakeKwentaV2.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeKwentaV2.rejected, (state) => {
			state.unstakeStatus = FetchStatus.Error
		})
		builder.addCase(stakeEscrowV2.pending, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Loading
		})
		builder.addCase(stakeEscrowV2.rejected, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Error
		})
		builder.addCase(unstakeEscrowV2.pending, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeEscrowV2.rejected, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Error
		})
		builder.addCase(claimStakingRewardsV2.pending, (state) => {
			state.getRewardStatus = FetchStatus.Loading
		})
		builder.addCase(claimStakingRewardsV2.rejected, (state) => {
			state.getRewardStatus = FetchStatus.Error
		})
	},
})

export default stakingSlice.reducer
export const { setSelectedEpoch, setSelectedEscrowVersion } = stakingSlice.actions
