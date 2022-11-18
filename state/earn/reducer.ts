import { createSlice } from '@reduxjs/toolkit';
import { FetchStatus } from 'state/types';

import { stakeTokens } from './actions';
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
		builder.addCase(stakeTokens.fulfilled, (state, action) => {});
	},
});

export const { setAmount } = earnSlice.actions;

export default earnSlice.reducer;
