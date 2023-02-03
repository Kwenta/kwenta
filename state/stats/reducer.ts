import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StatsTimeframe } from 'hooks/useStatsData';

import { StatsState } from './types';

const initialState: StatsState = {
	selectedTimeframe: '1M',
};

const statsSlice = createSlice({
	name: 'stats',
	initialState,
	reducers: {
		setSelectedTimeframe: (state, action: PayloadAction<StatsTimeframe>) => {
			state.selectedTimeframe = action.payload;
		},
	},
});

export const { setSelectedTimeframe } = statsSlice.actions;

export default statsSlice.reducer;
