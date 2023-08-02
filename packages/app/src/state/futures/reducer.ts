import { Period } from '@kwenta/sdk/constants'
import { SwapDepositToken } from '@kwenta/sdk/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults'
import {
	DEFAULT_MAP_BY_NETWORK,
	DEFAULT_QUERY_STATUS,
	LOADING_STATUS,
	SUCCESS_STATUS,
} from 'state/constants'
import { FetchStatus } from 'state/types'

import { fetchPositionHistoryForTrader } from './actions'
import { AppFuturesMarginType } from './common/types'
import { InputCurrencyDenomination, FuturesState } from './types'

export const FUTURES_INITIAL_STATE: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	selectedInputDenomination: 'usd',
	selectedInputHours: 1,
	selectedChart: 'price',
	selectedSwapDepositToken: SwapDepositToken.SUSD,
	preferences: {
		showHistory: true,
	},
	dashboard: {
		selectedPortfolioTimeframe: Period.ONE_WEEK,
	},
	leaderboard: {
		selectedTrader: undefined,
		selectedTraderPositionHistory: DEFAULT_MAP_BY_NETWORK,
	},
	tradePanelDrawerOpen: false,
	historicalFundingRatePeriod: Period.TWO_WEEKS,
	queryStatuses: {
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
	},
}

const futuresSlice = createSlice({
	name: 'futures',
	initialState: FUTURES_INITIAL_STATE,
	reducers: {
		setFuturesAccountType: (state, action: PayloadAction<AppFuturesMarginType>) => {
			state.selectedType = action.payload
		},
		setSelectedInputDenomination: (state, action: PayloadAction<InputCurrencyDenomination>) => {
			state.selectedInputDenomination = action.payload
		},
		setSelectedInputFundingRateHour: (state, action: PayloadAction<number>) => {
			state.selectedInputHours = action.payload
		},
		setSelectedTrader: (
			state,
			action: PayloadAction<{ trader: string; traderEns: string | undefined | null } | undefined>
		) => {
			state.leaderboard.selectedTrader = action.payload
		},
		setSelectedPortfolioTimeframe: (state, action: PayloadAction<Period>) => {
			state.dashboard.selectedPortfolioTimeframe = action.payload
		},
		setTradePanelDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.tradePanelDrawerOpen = action.payload
		},
		toggleShowTradeHistory: (state) => {
			state.preferences.showHistory = !state.preferences.showHistory
		},
		setSelectedChart: (state, action: PayloadAction<'price' | 'funding'>) => {
			state.selectedChart = action.payload
		},
		setHistoricalFundingRatePeriod: (state, action: PayloadAction<Period>) => {
			state.historicalFundingRatePeriod = action.payload
		},
		setSelectedSwapDepositToken: (state, action: PayloadAction<SwapDepositToken>) => {
			state.selectedSwapDepositToken = action.payload
		},
	},

	extraReducers(builder) {
		// Fetch position history for trader
		builder.addCase(fetchPositionHistoryForTrader.pending, (futuresState) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = LOADING_STATUS
		})
		builder.addCase(fetchPositionHistoryForTrader.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = SUCCESS_STATUS
			if (!payload) return
			futuresState.leaderboard.selectedTraderPositionHistory[payload.networkId] = {
				...futuresState.leaderboard.selectedTraderPositionHistory[payload.networkId],
				[payload.address]: payload.history,
			}
		})
		builder.addCase(fetchPositionHistoryForTrader.rejected, (futuresState) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = {
				error: 'Failed to fetch traders position history',
				status: FetchStatus.Error,
			}
		})
	},
})

export default futuresSlice.reducer

export const {
	setFuturesAccountType,
	setSelectedTrader,
	setSelectedInputDenomination,
	setSelectedInputFundingRateHour,
	setSelectedPortfolioTimeframe,
	setTradePanelDrawerOpen,
	toggleShowTradeHistory,
	setSelectedChart,
	setHistoricalFundingRatePeriod,
	setSelectedSwapDepositToken,
} = futuresSlice.actions
