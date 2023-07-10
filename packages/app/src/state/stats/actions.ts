import KwentaSDK from '@kwenta/sdk'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { ThunkConfig } from 'state/types'

export const fetchLeaderboard = createAsyncThunk<
	Awaited<ReturnType<KwentaSDK['stats']['getLeaderboard']>>,
	string,
	ThunkConfig
>('stats/fetchLeaderboard', async (searchTerm, { extra: { sdk } }) => {
	return sdk.stats.getLeaderboard(searchTerm)
})
