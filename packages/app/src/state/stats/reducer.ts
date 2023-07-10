import { DEFAULT_LEADERBOARD_DATA } from '@kwenta/sdk/constants'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { StatsTimeframe } from 'hooks/useStatsData'
import { DEFAULT_QUERY_STATUS, LOADING_STATUS, SUCCESS_STATUS } from 'state/constants'
import { FetchStatus } from 'state/types'

import { fetchLeaderboard } from './actions'
import { StatsState } from './types'

export const STATS_INITIAL_STATE: StatsState = {
	queryStatuses: {
		leaderboard: DEFAULT_QUERY_STATUS,
	},
	selectedTimeframe: '1M',
	leaderboard: DEFAULT_LEADERBOARD_DATA,
}

const statsSlice = createSlice({
	name: 'stats',
	initialState: STATS_INITIAL_STATE,
	reducers: {
		setSelectedTimeframe: (state, action: PayloadAction<StatsTimeframe>) => {
			state.selectedTimeframe = action.payload
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchLeaderboard.pending, (state) => {
			state.queryStatuses.leaderboard = LOADING_STATUS
		})
		builder.addCase(fetchLeaderboard.rejected, (state) => {
			state.queryStatuses.leaderboard = {
				status: FetchStatus.Error,
				error: 'Failed to fetch leaderboard',
			}
		})
		builder.addCase(fetchLeaderboard.fulfilled, (state, action) => {
			state.queryStatuses.leaderboard = SUCCESS_STATUS
			state.leaderboard = action.payload
		})
	},
})

export const { setSelectedTimeframe } = statsSlice.actions

export default statsSlice.reducer
