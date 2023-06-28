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
	getReward,
	stakeEscrow,
	stakeKwenta,
	unstakeEscrow,
	unstakeKwenta,
	vestEscrowedRewards,
	fetchStakingV2Data,
	fetchEscrowV2Data,
} from './actions'
import { StakingState } from './types'

export const STAKING_INITIAL_STATE: StakingState = {
	kwentaBalance: '0',
	escrowedKwentaBalance: '0',
	vKwentaBalance: '0',
	veKwentaBalance: '0',
	claimableBalance: '0',
	claimableBalanceV2: '0',
	totalStakedBalance: '0',
	totalStakedBalanceV2: '0',
	stakedEscrowedKwentaBalance: '0',
	stakedEscrowedKwentaBalanceV2: '0',
	stakedKwentaBalance: '0',
	epochPeriod: 0,
	weekCounter: 1,
	kwentaAllowance: '0',
	kwentaStakingV2Allowance: '0',
	vKwentaAllowance: '0',
	veKwentaAllowance: '0',
	totalVestable: '0',
	totalVestableV2: '0',
	escrowData: [],
	kwentaRewards: '0',
	opRewards: '0',
	snxOpRewards: '0',
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
		setSelectedEpoch: (state, action) => {
			state.selectedEpoch = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchStakingData.fulfilled, (state, action) => {
			state.escrowedKwentaBalance = action.payload.rewardEscrowBalance
			state.stakedKwentaBalance = action.payload.stakedNonEscrowedBalance
			state.stakedEscrowedKwentaBalance = action.payload.stakedEscrowedBalance
			state.claimableBalance = action.payload.claimableBalance
			state.kwentaBalance = action.payload.kwentaBalance
			state.weekCounter = action.payload.weekCounter
			state.totalStakedBalance = action.payload.totalStakedBalance
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
		})
		builder.addCase(fetchStakingV2Data.fulfilled, (state, action) => {
			state.totalStakedBalanceV2 = action.payload.totalStakedBalance
			state.kwentaStakingV2Allowance = action.payload.kwentaStakingV2Allowance
			state.claimableBalanceV2 = action.payload.claimableBalance
			state.stakedEscrowedKwentaBalanceV2 = action.payload.stakedEscrowedBalance
		})
		builder.addCase(fetchEscrowData.fulfilled, (state, action) => {
			state.totalVestable = action.payload.totalVestable
			state.escrowData = action.payload.escrowData
		})
		builder.addCase(fetchEscrowV2Data.fulfilled, (state, action) => {
			state.totalVestableV2 = action.payload.totalVestable
		})
		builder.addCase(fetchClaimableRewards.fulfilled, (state, action) => {
			state.claimableKwentaRewards = action.payload.claimableKwentaRewards
			state.claimableOpRewards = action.payload.claimableOpRewards
			state.claimableSnxOpRewards = action.payload.claimableSnxOpRewards
			state.kwentaRewards = action.payload.kwentaRewards
			state.opRewards = action.payload.opRewards
			state.snxOpRewards = action.payload.snxOpRewards
		})
		builder.addCase(stakeKwenta.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading
		})
		builder.addCase(stakeKwenta.rejected, (state) => {
			state.stakeStatus = FetchStatus.Idle
		})
		builder.addCase(unstakeKwenta.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeKwenta.rejected, (state) => {
			state.unstakeStatus = FetchStatus.Idle
		})
		builder.addCase(stakeEscrow.pending, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Loading
		})
		builder.addCase(stakeEscrow.rejected, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Idle
		})
		builder.addCase(unstakeEscrow.pending, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeEscrow.rejected, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Idle
		})
		builder.addCase(getReward.pending, (state) => {
			state.getRewardStatus = FetchStatus.Loading
		})
		builder.addCase(claimMultipleAllRewards.pending, (state) => {
			state.claimAllRewardsStatus = FetchStatus.Loading
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
			state.vestEscrowedRewardsStatus = FetchStatus.Idle
		})
	},
})

export default stakingSlice.reducer
export const { setSelectedEpoch } = stakingSlice.actions
