import { createSlice } from '@reduxjs/toolkit';

import { LeaderboardTab } from './types';

const leaderboardSlice = createSlice({
	name: 'leaderboard',
	initialState: {
		activeTab: LeaderboardTab.Top,
		activeTier: 'bronze',
		competitionRound: undefined,
		searchInput: '',
		searchTerm: '',
		searchAddress: '',
		selectedTrader: '',
	},
	reducers: {},
});

export default leaderboardSlice.reducer;
