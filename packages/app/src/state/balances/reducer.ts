import { createSlice } from '@reduxjs/toolkit'

import { FetchStatus } from 'state/types'

import { fetchBalances } from './actions'
import { BalancesState } from './types'

export const ZERO_BALANCES = {
	synthBalances: [],
	synthBalancesMap: {},
	totalUSDBalance: '0',
	susdWalletBalance: '0',
	tokenBalances: {},
}

export const BALANCES_INITIAL_STATE: BalancesState = {
	status: FetchStatus.Idle,
	error: undefined,
	...ZERO_BALANCES,
}

const balancesSlice = createSlice({
	name: 'balances',
	initialState: BALANCES_INITIAL_STATE,
	reducers: {
		clearBalances: (state) => {
			state.synthBalances = []
			state.synthBalancesMap = {}
			state.totalUSDBalance = undefined
			state.susdWalletBalance = undefined
			state.error = undefined
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchBalances.pending, (state) => {
			state.status = FetchStatus.Loading
		})
		builder.addCase(fetchBalances.fulfilled, (state, action) => {
			state.status = FetchStatus.Success
			state.synthBalances = action.payload.synthBalances
			state.totalUSDBalance = action.payload.totalUSDBalance
			state.synthBalancesMap = action.payload.synthBalancesMap
			state.susdWalletBalance = action.payload.susdWalletBalance
			state.tokenBalances = action.payload.tokenBalances
		})
		builder.addCase(fetchBalances.rejected, (state) => {
			state.status = FetchStatus.Error
		})
	},
})

export default balancesSlice.reducer
