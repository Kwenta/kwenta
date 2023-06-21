import { createSlice } from '@reduxjs/toolkit'

import { FetchStatus } from 'state/types'

import { fetchEarnTokenPrices, stakeTokens, unstakeTokens } from './actions'
import { EarnState } from './types'

export const EARN_INITIAL_STATE: EarnState = {
	balance: '0',
	earnedRewards: '0',
	rewardRate: '0',
	totalSupply: '0',
	lpTokenBalance: '0',
	allowance: '0',
	error: undefined,
	stakeStatus: FetchStatus.Idle,
	unstakeStatus: FetchStatus.Idle,
	endDate: 0,
	wethAmount: '0',
	kwentaAmount: '0',
	lpTotalSupply: '0',
	wethPrice: '0',
	kwentaPrice: '0',
	opPrice: '0',
}

const earnSlice = createSlice({
	name: 'earn',
	initialState: EARN_INITIAL_STATE,
	reducers: {
		setEarnDetails: (state, action) => {
			state.balance = action.payload.balance
			state.earnedRewards = action.payload.earnedRewards
			state.endDate = action.payload.endDate
			state.rewardRate = action.payload.rewardRate
			state.totalSupply = action.payload.totalSupply
			state.lpTokenBalance = action.payload.lpTokenBalance
			state.allowance = action.payload.allowance
			state.wethAmount = action.payload.wethAmount
			state.kwentaAmount = action.payload.kwentaAmount
			state.lpTotalSupply = action.payload.lpTotalSupply
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchEarnTokenPrices.fulfilled, (state, action) => {
			state.kwentaPrice = action.payload.kwentaPrice
			state.wethPrice = action.payload.wethPrice
			state.opPrice = action.payload.opPrice
		})
		builder.addCase(stakeTokens.pending, (state) => {
			state.stakeStatus = FetchStatus.Loading
		})
		builder.addCase(unstakeTokens.pending, (state) => {
			state.unstakeStatus = FetchStatus.Loading
		})
	},
})

export default earnSlice.reducer
