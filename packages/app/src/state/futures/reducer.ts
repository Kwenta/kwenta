import { Period } from '@kwenta/sdk/constants'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults'
import { DEFAULT_MAP_BY_NETWORK } from 'state/constants'

import { AppFuturesMarginType } from './common/types'
import { InputCurrencyDenomination, FuturesState } from './types'

export const FUTURES_INITIAL_STATE: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	selectedInputDenomination: 'usd',
	selectedInputHours: 1,
	selectedChart: 'price',
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
} = futuresSlice.actions
