import { createSlice } from '@reduxjs/toolkit';

import { FetchStatus } from 'state/types';

import { fetchEarnTokenPrice, stakeTokens, unstakeTokens } from './actions';
import { EarnState } from './types';

const initialState: EarnState = {
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
	wethAmount: '0',
	kwentaAmount: '0',
	lpTotalSupply: '0',
	wethPrice: '0',
	kwentaPrice: '0',
};

const earnSlice = createSlice({
	name: 'earn',
	initialState,
	reducers: {
		setEarnDetails: (state, action) => {
			state.balance = action.payload.balance;
			state.earnedRewards = action.payload.earnedRewards;
			state.endDate = action.payload.endDate;
			state.rewardRate = action.payload.rewardRate;
			state.totalSupply = action.payload.totalSupply;
			state.lpTokenBalance = action.payload.lpTokenBalance;
			state.allowance = action.payload.allowance;
			state.wethAmount = action.payload.wethAmount;
			state.kwentaAmount = action.payload.kwentaAmount;
			state.lpTotalSupply = action.payload.lpTotalSupply;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchEarnTokenPrice.fulfilled, (state, action) => {
			state.kwentaPrice = action.payload.kwentaPrice;
			state.wethPrice = action.payload.wethPrice;
		});
		builder.addCase(stakeTokens.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading;
		});
		builder.addCase(unstakeTokens.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading;
		});
	},
});

export default earnSlice.reducer;
