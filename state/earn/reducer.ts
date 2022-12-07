import { createSlice } from '@reduxjs/toolkit';

import { FetchStatus } from 'state/types';

import { stakeTokens, unstakeTokens } from './actions';
import { EarnState } from './types';

const initialState: EarnState = {
	amount: '',
	balance: '0',
	earnedRewards: '0',
	rewardRate: '0',
	totalSupply: '0',
	lpTokenBalance: '0',
	allowance: '0',
	error: undefined,
	stakeStatus: FetchStatus.Idle,
	unstakeStatus: FetchStatus.Idle,
	endDate: 0,
};

const earnSlice = createSlice({
	name: 'earn',
	initialState,
	reducers: {
		setAmount: (state, action) => {
			state.amount = action.payload;
		},
		setEarnDetails: (state, action) => {
			state.balance = action.payload.balance;
			state.earnedRewards = action.payload.earnedRewards;
			state.endDate = action.payload.endDate;
			state.rewardRate = action.payload.rewardRate;
			state.totalSupply = action.payload.totalSupply;
			state.lpTokenBalance = action.payload.lpTokenBalance;
			state.allowance = action.payload.allowance;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(stakeTokens.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading;
		});
		builder.addCase(unstakeTokens.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading;
		});
	},
});

export const { setAmount } = earnSlice.actions;

export default earnSlice.reducer;
