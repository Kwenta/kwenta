import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { StatsTimeframe } from 'hooks/useStatsData';

import { StatsState } from './types';

export const STATS_INITIAL_STATE: StatsState = {
	selectedTimeframe: '1M',
};

const statsSlice = createSlice({
	name: 'stats',
	initialState: STATS_INITIAL_STATE,
	reducers: {
		setSelectedTimeframe: (state, action: PayloadAction<StatsTimeframe>) => {
			state.selectedTimeframe = action.payload;
		},
	},
});

export const { setSelectedTimeframe } = statsSlice.actions;

export default statsSlice.reducer;
