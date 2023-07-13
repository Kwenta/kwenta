import KwentaSDK from '@kwenta/sdk'
import { FuturesMarket } from '@kwenta/sdk/types'
import { createSlice } from '@reduxjs/toolkit'

import { FetchStatus } from 'state/types'

import { fetchFuturesStats, fetchOptimismMarkets } from './actions'

type HomeState = {
	optimismMarkets: FuturesMarket<string>[]
	marketsQueryStatus: FetchStatus
	futuresStatsQueryStatus: FetchStatus
	futuresStats: Awaited<ReturnType<KwentaSDK['stats']['getFuturesStats']>>
}

export const HOME_INITIAL_STATE: HomeState = {
	optimismMarkets: [],
	marketsQueryStatus: FetchStatus.Idle,
	futuresStatsQueryStatus: FetchStatus.Idle,
	futuresStats: [],
}

export const homeSlice = createSlice({
	name: 'home',
	initialState: HOME_INITIAL_STATE,
	reducers: {},
	extraReducers: (builder) => {
		builder.addCase(fetchOptimismMarkets.pending, (state) => {
			state.marketsQueryStatus = FetchStatus.Loading
		})
		builder.addCase(fetchOptimismMarkets.fulfilled, (state, action) => {
			state.optimismMarkets = action.payload.markets
		})
		builder.addCase(fetchOptimismMarkets.rejected, (state) => {
			state.marketsQueryStatus = FetchStatus.Error
		})
		builder.addCase(fetchFuturesStats.pending, (state) => {
			state.futuresStatsQueryStatus = FetchStatus.Loading
		})
		builder.addCase(fetchFuturesStats.fulfilled, (state, action) => {
			state.futuresStatsQueryStatus = FetchStatus.Success
			state.futuresStats = action.payload
		})
		builder.addCase(fetchFuturesStats.rejected, (state) => {
			state.futuresStatsQueryStatus = FetchStatus.Error
		})
	},
})

export default homeSlice.reducer
