import KwentaSDK from '@kwenta/sdk'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { ThunkConfig } from 'state/types'
import logError from 'utils/logError'

import { selectLeaderboardSearchTerm } from './selectors'

export const fetchLeaderboard = createAsyncThunk<
	Awaited<ReturnType<KwentaSDK['stats']['getLeaderboard']>>,
	void,
	ThunkConfig
>('stats/fetchLeaderboard', async (_, { getState, extra: { sdk } }) => {
	const searchTerm = selectLeaderboardSearchTerm(getState())

	try {
		return await sdk.stats.getLeaderboard(searchTerm)
	} catch (error) {
		logError(error)
		notifyError(error)
		throw error
	}
})
