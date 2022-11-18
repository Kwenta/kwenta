import { createSlice } from '@reduxjs/toolkit';
import { FetchStatus } from 'state/types';

import { stakeTokens, unstakeTokens } from './actions';
import { EarnState } from './types';

const initialState: EarnState = {
	amount: '',
	error: undefined,
	stakeStatus: FetchStatus.Idle,
	unstakeStatus: FetchStatus.Idle,
};

const earnSlice = createSlice({
	name: 'earn',
	initialState,
	reducers: {
		setAmount: (state, action) => {
			state.amount = action.payload;
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
