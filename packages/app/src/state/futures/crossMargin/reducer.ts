import { Period } from '@kwenta/sdk/constants'
import {
	NetworkId,
	FuturesMarketAsset,
	FuturesPotentialTradeDetails,
	PositionSide,
} from '@kwenta/sdk/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ORDER_PREVIEW_ERRORS } from 'queries/futures/constants'
import {
	DEFAULT_MAP_BY_NETWORK,
	DEFAULT_QUERY_STATUS,
	LOADING_STATUS,
	SUCCESS_STATUS,
	ZERO_STATE_CM_ACCOUNT,
	ZERO_STATE_TRADE_INPUTS,
} from 'state/constants'
import { FetchStatus } from 'state/types'

import { refetchPosition, fetchFundingRatesHistory } from '../actions'
import { PreviewAction, TradeSizeInputs } from '../common/types'

import {
	fetchCrossMarginOpenOrders,
	fetchCrossMarginPositions,
	fetchPositionHistoryV3,
	fetchMarketsV3,
	fetchPerpsV3Account,
} from './actions'
import {
	EditPositionInputs,
	InputCurrencyDenomination,
	CrossMarginAccountData,
	CrossMarginState,
} from './types'

export const COSS_MARGIN_INITIAL_STATE: CrossMarginState = {
	confirmationModalOpen: false,
	markets: {
		420: [],
		10: [],
	},
	dailyMarketVolumes: {},
	accounts: DEFAULT_MAP_BY_NETWORK,
	selectedMarketAsset: FuturesMarketAsset.sETH,
	leverageSide: PositionSide.LONG,
	orderType: 'market',
	previews: {
		trade: null,
		close: null,
		edit: null,
	},
	closePositionOrderInputs: {
		nativeSizeDelta: '',
	},
	previewDebounceCount: 0,
	perpsV3MarketProxyAddress: undefined,
	tradeInputs: ZERO_STATE_TRADE_INPUTS,
	editPositionInputs: {
		nativeSizeDelta: '',
		marginDelta: '',
	},
	tradeFee: '0',
	leverageInput: '0',
	fundingRates: [],
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
	queryStatuses: {
		markets: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		positions: DEFAULT_QUERY_STATUS,
		account: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		crossMarginTradePreview: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		historicalFundingRates: DEFAULT_QUERY_STATUS,
		// TODO: Separate cross / smart query status
		smartMarginTradePreview: DEFAULT_QUERY_STATUS,
		smartMarginBalanceInfo: DEFAULT_QUERY_STATUS,
	},
	historicalFundingRates: {},
}

const crossMarginSlice = createSlice({
	name: 'crossMargin',
	initialState: COSS_MARGIN_INITIAL_STATE,
	reducers: {
		setMarketAsset: (state, action) => {
			state.selectedMarketAsset = action.payload
			state.tradeInputs = ZERO_STATE_TRADE_INPUTS
		},
		setClosePositionSizeDelta: (state, action: PayloadAction<string>) => {
			state.closePositionOrderInputs.nativeSizeDelta = action.payload
		},
		setCrossMarginLeverageSide: (state, action) => {
			state.leverageSide = action.payload
		},
		setTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
			state.tradeInputs = action.payload
		},
		setEditPositionInputs: (state, action: PayloadAction<EditPositionInputs<string>>) => {
			state.editPositionInputs = action.payload
		},
		setSelectedInputDenomination: (state, action: PayloadAction<InputCurrencyDenomination>) => {
			state.selectedInputDenomination = action.payload
		},
		setSelectedInputFundingRateHour: (state, action: PayloadAction<number>) => {
			state.selectedInputHours = action.payload
		},
		setTradeFee: (state, action: PayloadAction<string>) => {
			state.tradeFee = action.payload
		},
		setLeverageInput: (state, action: PayloadAction<string>) => {
			state.leverageInput = action.payload
		},
		setPerpsV3MarketProxyAddress: (state, action: PayloadAction<string | undefined>) => {
			state.perpsV3MarketProxyAddress = action.payload
		},
		handlePreviewError: (
			futuresState,
			{
				payload,
			}: PayloadAction<{
				error: string
				previewType: PreviewAction
			}>
		) => {
			const message = Object.values(ORDER_PREVIEW_ERRORS).includes(payload.error)
				? payload.error
				: 'Failed to get trade preview'
			futuresState.queryStatuses.crossMarginTradePreview = {
				status: FetchStatus.Error,
				error: message,
			}
			futuresState.previews[payload.previewType] = null
		},

		setPerpsV3Account: (
			state,
			action: PayloadAction<{ wallet: string; account: string; network: NetworkId }>
		) => {
			const { account, wallet, network } = action.payload
			if (!state.accounts[network]?.[wallet]?.account) {
				state.accounts[network] = {
					...state.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				}
			}
		},
		setTradePreview: (
			state,
			{
				payload,
			}: PayloadAction<{
				preview: FuturesPotentialTradeDetails<string> | null
				type: PreviewAction
			}>
		) => {
			state.previews[payload.type] = payload.preview
		},
		clearAllTradePreviews: (state) => {
			state.previews = {
				edit: null,
				trade: null,
				close: null,
			}
			state.queryStatuses.crossMarginTradePreview = DEFAULT_QUERY_STATUS
		},
		setSelectedTrader: (state, action: PayloadAction<string | undefined>) => {
			state.leaderboard.selectedTrader = action.payload
		},
		incrementPreviewCount: (state) => {
			state.previewDebounceCount = state.previewDebounceCount + 1
		},
		setSelectedPortfolioTimeframe: (state, action: PayloadAction<Period>) => {
			state.dashboard.selectedPortfolioTimeframe = action.payload
		},
		setShowTradeHistory: (state, action: PayloadAction<boolean>) => {
			state.preferences.showHistory = action.payload
		},
		setSelectedChart: (state, action: PayloadAction<'price' | 'funding'>) => {
			state.selectedChart = action.payload
		},
	},
	extraReducers: (builder) => {
		// Markets
		builder.addCase(fetchMarketsV3.pending, (futuresState) => {
			futuresState.queryStatuses.markets = LOADING_STATUS
		})
		builder.addCase(fetchMarketsV3.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.markets = SUCCESS_STATUS
			if (payload) {
				futuresState.markets[payload.networkId] = payload.markets
			}
		})
		builder.addCase(fetchMarketsV3.rejected, (futuresState) => {
			futuresState.queryStatuses.markets = {
				status: FetchStatus.Error,
				error: 'Failed to fetch markets',
			}
		})

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.positions = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.positions = SUCCESS_STATUS
			if (!action.payload) return
			const { account, positions, network } = action.payload
			const wallet = findWalletForAccount(futuresState, account, network)
			if (wallet) {
				updateCrossMarginAccount(futuresState, network, wallet, { positions })
			}
		})
		builder.addCase(fetchCrossMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.positions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			}
		})

		// Refetch selected position
		builder.addCase(refetchPosition.fulfilled, (futuresState, { payload }) => {
			if (payload) {
				const { position, wallet, networkId } = payload
				const account = futuresState.accounts[networkId]?.[wallet]

				const existingPositions = account?.positions ?? []
				const index = existingPositions.findIndex((p) => p.marketKey === position.marketKey)
				existingPositions[index] = position
				futuresState.accounts[networkId][wallet] = {
					...account,
					positions: existingPositions,
				}
			}
		})

		// Fetch Isolated Open Orders
		builder.addCase(fetchCrossMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginOpenOrders.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS
			if (payload) {
				const { orders: delayedOrders, wallet, networkId } = payload
				updateCrossMarginAccount(futuresState, networkId, wallet, {
					delayedOrders,
				})
			}
		})
		builder.addCase(fetchCrossMarginOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for isolated margin',
			}
		})

		// TODO: Fetch Cross Margin Trade Preview
		// builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
		// 	futuresState.queryStatuses.crossMarginTradePreview = LOADING_STATUS
		// })
		// builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, { payload }) => {
		// 	futuresState.previews[payload.type] = payload.preview
		// 	futuresState.queryStatuses.crossMarginTradePreview = SUCCESS_STATUS
		// })

		// Fetch cross margin account
		builder.addCase(fetchPerpsV3Account.pending, (futuresState) => {
			futuresState.queryStatuses.account = LOADING_STATUS
		})
		builder.addCase(fetchPerpsV3Account.fulfilled, (futuresState, action) => {
			if (action.payload) {
				const { network, account, wallet } = action.payload
				futuresState.accounts[network] = {
					...futuresState.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				}
			}
			futuresState.queryStatuses.account = SUCCESS_STATUS
		})
		builder.addCase(fetchPerpsV3Account.rejected, (futuresState) => {
			futuresState.queryStatuses.account = {
				status: FetchStatus.Error,
				error: 'Failed to fetch account',
			}
		})

		// Fetch position history
		builder.addCase(fetchPositionHistoryV3.pending, (futuresState) => {
			futuresState.queryStatuses.positionHistory = LOADING_STATUS
		})
		builder.addCase(fetchPositionHistoryV3.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.positionHistory = SUCCESS_STATUS
			if (payload) {
				const { history: positionHistory, networkId, wallet } = payload
				updateCrossMarginAccount(futuresState, networkId, wallet, {
					positionHistory,
				})
			}
		})
		builder.addCase(fetchPositionHistoryV3.rejected, (futuresState) => {
			futuresState.queryStatuses.positionHistory = {
				error: 'Failed to fetch position history',
				status: FetchStatus.Error,
			}
		})

		// Fetch funding rates
		builder.addCase(fetchFundingRatesHistory.rejected, (futuresState) => {
			futuresState.queryStatuses.historicalFundingRates = {
				error: 'Failed to fetch funding rates',
				status: FetchStatus.Error,
			}
		})
		builder.addCase(fetchFundingRatesHistory.fulfilled, (futuresState, { payload }) => {
			futuresState.historicalFundingRates[payload.marketAsset] = payload.rates
		})
	},
})

export default crossMarginSlice.reducer

export const {
	handlePreviewError,
	setMarketAsset,
	setClosePositionSizeDelta,
	setCrossMarginLeverageSide,
	setLeverageInput,
	clearAllTradePreviews,
	setSelectedTrader,
	setSelectedInputDenomination,
	setSelectedInputFundingRateHour,
	setSelectedPortfolioTimeframe,
	setShowTradeHistory,
	setSelectedChart,
	setPerpsV3Account,
	setPerpsV3MarketProxyAddress,
} = crossMarginSlice.actions

const findWalletForAccount = (
	perpsV3State: CrossMarginState,
	account: string,
	network: NetworkId
) => {
	const entry = Object.entries(perpsV3State.accounts[network]).find(([_, value]) => {
		return value.account === account
	})
	return entry ? entry[0] : undefined
}

const updateCrossMarginAccount = (
	futuresState: CrossMarginState,
	network: NetworkId,
	wallet: string,
	newAccountData: Partial<CrossMarginAccountData>
) => {
	const updatedAccount = {
		...ZERO_STATE_CM_ACCOUNT,
		...futuresState.accounts[network]?.[wallet],
		...newAccountData,
	}
	futuresState.accounts[network] = {
		...futuresState.accounts[network],
		[wallet]: updatedAccount,
	}
}
