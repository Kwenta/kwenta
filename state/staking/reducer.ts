import { createSlice } from '@reduxjs/toolkit';

import { StakingState } from './types';

const initialState: StakingState = {
	kwentaBalance: '0',
	vKwentaBalance: '0',
	veKwentaBalance: '0',
};

const stakingSlice = createSlice({
	name: 'staking',
	initialState,
	reducers: {},
	extraReducers: {},
});

export default stakingSlice.reducer;
