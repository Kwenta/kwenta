import { Period } from '@kwenta/sdk/constants'
import { NetworkId, FuturesMarketAsset, PositionSide } from '@kwenta/sdk/types'
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

import { fetchFundingRatesHistory } from '../actions'
import { PreviewAction, TradeSizeInputs } from '../common/types'

import {
	fetchCrossMarginOpenOrders,
	fetchCrossMarginPositions,
	fetchPositionHistoryV3,
	fetchV3Markets,
	fetchPerpsV3Account,
	fetchAvailableMargin,
} from './actions'
import { fetchCrossMarginTradePreview } from './actions'
import {
	EditPositionInputs,
	InputCurrencyDenomination,
	CrossMarginAccountData,
	CrossMarginState,
	CrossMarginTradePreview,
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
	queryStatuses: {
		markets: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		positions: DEFAULT_QUERY_STATUS,
		account: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		tradePreview: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		historicalFundingRates: DEFAULT_QUERY_STATUS,
		futuresFees: DEFAULT_QUERY_STATUS,
		futuresFeesForAccount: DEFAULT_QUERY_STATUS,
		availableMargin: DEFAULT_QUERY_STATUS,
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
		setCrossMarginTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
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
		setCrossMarginLeverageInput: (state, action: PayloadAction<string>) => {
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
			futuresState.queryStatuses.tradePreview = {
				status: FetchStatus.Error,
				error: message,
			}
			futuresState.previews[payload.previewType] = null
		},

		setPerpsV3Account: (
			state,
			action: PayloadAction<{ wallet: string; account: number; network: NetworkId }>
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
		setCrossMarginTradePreview: (
			state,
			{
				payload,
			}: PayloadAction<{
				preview: CrossMarginTradePreview<string> | null
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
			state.queryStatuses.tradePreview = DEFAULT_QUERY_STATUS
		},
		incrementPreviewCrossMarginCount: (state) => {
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
		builder.addCase(fetchV3Markets.pending, (futuresState) => {
			futuresState.queryStatuses.markets = LOADING_STATUS
		})
		builder.addCase(fetchV3Markets.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.markets = SUCCESS_STATUS
			if (payload) {
				futuresState.markets[payload.networkId] = payload.markets
			}
		})
		builder.addCase(fetchV3Markets.rejected, (futuresState) => {
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

		// TODO: Refetch cross margin position
		// Refetch selected position
		// builder.addCase(refetchPosition.fulfilled, (futuresState, { payload }) => {
		// 	if (payload) {
		// 		const { position, wallet, networkId } = payload
		// 		const account = futuresState.accounts[networkId]?.[wallet]

		// 		const existingPositions = account?.positions ?? []
		// 		const index = existingPositions.findIndex((p) => p.marketKey === position.marketKey)
		// 		existingPositions[index] = position
		// 		futuresState.accounts[networkId][wallet] = {
		// 			...account,
		// 			positions: existingPositions,
		// 		}
		// 	}
		// })

		// Fetch Isolated Open Orders
		builder.addCase(fetchCrossMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginOpenOrders.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS
			if (payload) {
				const { orders: asyncOrders, wallet, networkId } = payload
				updateCrossMarginAccount(futuresState, networkId, wallet, {
					asyncOrders,
				})
			}
		})
		builder.addCase(fetchCrossMarginOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for isolated margin',
			}
		})

		// Fetch cross margin trade preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.tradePreview = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, { payload }) => {
			futuresState.previews[payload.type] = payload.preview
			futuresState.queryStatuses.tradePreview = SUCCESS_STATUS
		})
		builder.addCase(fetchCrossMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to generate trade preview',
			}
		})

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

		builder.addCase(fetchAvailableMargin.pending, (futuresState) => {
			futuresState.queryStatuses.availableMargin = LOADING_STATUS
		})
		builder.addCase(fetchAvailableMargin.fulfilled, (futuresState, { payload }) => {
			if (payload) {
				const { wallet, availableMargin, network } = payload
				updateCrossMarginAccount(futuresState, network, wallet, {
					availableMargin,
				})
			}
			futuresState.queryStatuses.availableMargin = SUCCESS_STATUS
		})
		builder.addCase(fetchAvailableMargin.rejected, (futuresState) => {
			futuresState.queryStatuses.availableMargin = {
				status: FetchStatus.Error,
				error: 'Failed to fetch available margin',
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
	setCrossMarginLeverageInput,
	clearAllTradePreviews,
	setSelectedInputDenomination,
	setSelectedInputFundingRateHour,
	setSelectedPortfolioTimeframe,
	setShowTradeHistory,
	setSelectedChart,
	setPerpsV3Account,
	setPerpsV3MarketProxyAddress,
	setCrossMarginTradeInputs,
	setCrossMarginTradePreview,
	incrementPreviewCrossMarginCount,
} = crossMarginSlice.actions

const findWalletForAccount = (
	perpsV3State: CrossMarginState,
	account: number,
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
