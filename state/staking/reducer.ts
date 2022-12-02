import { createSlice } from '@reduxjs/toolkit';

import { FetchStatus } from 'state/types';

import {
	claimMultipleRewards,
	fetchClaimableRewards,
	fetchEscrowData,
	fetchStakingData,
	getReward,
	stakeEscrow,
	stakeKwenta,
	unstakeEscrow,
	unstakeKwenta,
	vestEscrowedRewards,
} from './actions';
import { StakingState } from './types';

const initialState: StakingState = {
	kwentaBalance: '0',
	escrowedKwentaBalance: '0',
	vKwentaBalance: '0',
	veKwentaBalance: '0',
	claimableBalance: '0',
	totalStakedBalance: '0',
	stakedEscrowedKwentaBalance: '0',
	stakedKwentaBalance: '0',
	epochPeriod: 0,
	weekCounter: 1,
	kwentaAllowance: '0',
	vKwentaAllowance: '0',
	veKwentaAllowance: '0',
	totalVestable: '0',
	escrowData: [],
	totalRewards: '0',
	claimableRewards: [],
	stakeStatus: FetchStatus.Idle,
	unstakeStatus: FetchStatus.Idle,
	stakeEscrowedStatus: FetchStatus.Idle,
	unstakeEscrowedStatus: FetchStatus.Idle,
	getRewardStatus: FetchStatus.Idle,
	claimRewardsStatus: FetchStatus.Idle,
	vestEscrowedRewardsStatus: FetchStatus.Idle,
};

const stakingSlice = createSlice({
	name: 'staking',
	initialState,
	reducers: {
		setStakeStatus: (state, action) => {
			state.stakeStatus = action.payload;
		},
		setUnstakeStatus: (state, action) => {
			state.unstakeStatus = action.payload;
		},
		setStakeEscrowedStatus: (state, action) => {
			state.stakeEscrowedStatus = action.payload;
		},
		setUnstakeEscrowedStatus: (state, action) => {
			state.unstakeEscrowedStatus = action.payload;
		},
		setGetRewardStatus: (state, action) => {
			state.getRewardStatus = action.payload;
		},
		setClaimRewardsStatus: (state, action) => {
			state.claimRewardsStatus = action.payload;
		},
		setVestEscrowedRewardsStatus: (state, action) => {
			state.vestEscrowedRewardsStatus = action.payload;
		},
		setSelectedEpoch: (state, action) => {
			state.selectedEpoch = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchStakingData.fulfilled, (state, action) => {
			state.escrowedKwentaBalance = action.payload.rewardEscrowBalance;
			state.stakedKwentaBalance = action.payload.stakedNonEscrowedBalance;
			state.stakedEscrowedKwentaBalance = action.payload.stakedEscrowedBalance;
			state.claimableBalance = action.payload.claimableBalance;
			state.kwentaBalance = action.payload.kwentaBalance;
			state.weekCounter = action.payload.weekCounter;
			state.totalStakedBalance = action.payload.totalStakedBalance;
			state.vKwentaBalance = action.payload.vKwentaBalance;
			state.vKwentaAllowance = action.payload.vKwentaAllowance;
			state.kwentaAllowance = action.payload.kwentaAllowance;
			state.epochPeriod = action.payload.epochPeriod;
			state.veKwentaBalance = action.payload.veKwentaBalance;
			state.veKwentaAllowance = action.payload.veKwentaAllowance;
		});
		builder.addCase(fetchEscrowData.fulfilled, (state, action) => {
			state.totalVestable = action.payload.totalVestable;
			state.escrowData = action.payload.escrowData;
		});
		builder.addCase(fetchClaimableRewards.fulfilled, (state, action) => {
			state.claimableRewards = action.payload.claimableRewards;
			state.totalRewards = action.payload.totalRewards;
		});
		builder.addCase(stakeKwenta.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading;
		});
		builder.addCase(unstakeKwenta.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading;
		});
		builder.addCase(stakeEscrow.pending, (state) => {
			state.stakeEscrowedStatus = FetchStatus.Loading;
		});
		builder.addCase(unstakeEscrow.pending, (state) => {
			state.unstakeEscrowedStatus = FetchStatus.Loading;
		});
		builder.addCase(getReward.pending, (state) => {
			state.getRewardStatus = FetchStatus.Loading;
		});
		builder.addCase(claimMultipleRewards.pending, (state) => {
			state.claimRewardsStatus = FetchStatus.Loading;
		});
		builder.addCase(vestEscrowedRewards.pending, (state) => {
			state.vestEscrowedRewardsStatus = FetchStatus.Loading;
		});
	},
});

export default stakingSlice.reducer;
export const { setSelectedEpoch } = stakingSlice.actions;
