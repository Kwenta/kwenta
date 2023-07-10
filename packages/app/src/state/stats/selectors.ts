import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state/store'
import { FetchStatus } from 'state/types'

import { unserializeLeaderboard } from './utils'

export const selectSelectedTimeframe = (state: RootState) => state.stats.selectedTimeframe

export const selectMinTimestamp = createSelector(
	(state: RootState) => state.stats.selectedTimeframe,
	(selectedTimeframe) => {
		if (selectedTimeframe === 'MAX') return 0

		const timeframeSeconds =
			selectedTimeframe === '1M'
				? 60 * 60 * 24 * 30
				: selectedTimeframe === '1Y'
				? 60 * 60 * 24 * 365
				: 0
		const currentTimestamp = new Date().getTime() / 1000
		return Math.floor(currentTimestamp - timeframeSeconds)
	}
)

export const selectLeaderboard = createSelector(
	(state: RootState) => state.stats.leaderboard,
	unserializeLeaderboard
)

export const selectLeaderboardLoading = (state: RootState) =>
	state.stats.queryStatuses.leaderboard.status === FetchStatus.Loading
