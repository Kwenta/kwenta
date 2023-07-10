import KwentaSDK from '@kwenta/sdk'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { ThunkConfig } from 'state/types'
import logError from 'utils/logError'

export const fetchLeaderboard = createAsyncThunk<
	Awaited<ReturnType<KwentaSDK['stats']['getLeaderboard']>>,
	string,
	ThunkConfig
>('stats/fetchLeaderboard', async (searchTerm, { extra: { sdk } }) => {
	try {
		return await sdk.stats.getLeaderboard(searchTerm)
	} catch (error) {
		logError(error)
		notifyError(error)
		throw error
	}
})
