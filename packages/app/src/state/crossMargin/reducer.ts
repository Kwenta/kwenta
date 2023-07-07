import { Period } from '@kwenta/sdk/constants'
import {
	NetworkId,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesPotentialTradeDetails,
	PositionSide,
	FuturesTrade,
} from '@kwenta/sdk/types'
import { MarketKeyByAsset } from '@kwenta/sdk/utils'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults'
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

import {
	fetchDailyVolumes,
	refetchPosition,
	fetchCrossMarginTradePreview,
	fetchSmartMarginAccount,
	fetchMarginTransfers,
	fetchFundingRatesHistory,
} from '../futures/actions'
import {
	EditPositionInputs,
	InputCurrencyDenomination,
	PerpsV3AccountData,
	TradeSizeInputs,
	PerpsV3State,
	PreviewAction,
} from './types'
import {
	fetchCrossMarginOpenOrders,
	fetchCrossMarginPositions,
	fetchPerpsV3PositionHistory,
	fetchV3Markets,
} from './actions'

export const PERPS_V3_INITIAL_STATE: PerpsV3State = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	markets: {
		420: [],
		10: [],
	},
	dailyMarketVolumes: {},
	accounts: DEFAULT_MAP_BY_NETWORK,
	selectedMarketAsset: FuturesMarketAsset.sETH,
	selectedMarketKey: FuturesMarketKey.sETHPERP,
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
		perpsV3Positions: DEFAULT_QUERY_STATUS,
		perpsV3PositionHistory: DEFAULT_QUERY_STATUS,
		perpsV3Account: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		perpsV3TradePreview: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		historicalFundingRates: DEFAULT_QUERY_STATUS,
	},
	tradePanelDrawerOpen: false,
	historicalFundingRates: {},
}

const futuresSlice = createSlice({
	name: 'futures',
	initialState: PERPS_V3_INITIAL_STATE,
	reducers: {
		setMarketAsset: (state, action) => {
			state.selectedMarketAsset = action.payload
			state.selectedMarketKey = MarketKeyByAsset[action.payload as FuturesMarketAsset]
			state.tradeInputs = ZERO_STATE_TRADE_INPUTS
			state.selectedMarketAsset = action.payload
		},
		setClosePositionSizeDelta: (state, action: PayloadAction<string>) => {
			state.closePositionOrderInputs.nativeSizeDelta = action.payload
		},
		setLeverageSide: (state, action) => {
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
			futuresState.queryStatuses.perpsV3TradePreview = {
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
			state.queryStatuses.perpsV3TradePreview = DEFAULT_QUERY_STATUS
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
		setTradePanelDrawerOpen: (state, action: PayloadAction<boolean>) => {
			state.tradePanelDrawerOpen = action.payload
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

		// Daily volumes
		builder.addCase(fetchDailyVolumes.pending, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = LOADING_STATUS
		})
		builder.addCase(fetchDailyVolumes.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.dailyVolumes = SUCCESS_STATUS
			futuresState.dailyMarketVolumes = action.payload
		})
		builder.addCase(fetchDailyVolumes.rejected, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = {
				status: FetchStatus.Error,
				error: 'Failed to fetch volume data',
			}
		})

		// margin transfers
		builder.addCase(fetchMarginTransfers.pending, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = LOADING_STATUS
		})
		builder.addCase(fetchMarginTransfers.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.marginTransfers = SUCCESS_STATUS
			if (payload) {
				const { context, marginTransfers } = payload
				const newAccountData = { marginTransfers }
				updateCrossMarginAccount(futuresState, context.network, context.wallet, newAccountData)
			}
		})
		builder.addCase(fetchMarginTransfers.rejected, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = {
				status: FetchStatus.Error,
				error: 'Failed to fetch margin transfers',
			}
		})

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.perpsV3Positions = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.perpsV3Positions = SUCCESS_STATUS
			if (!action.payload) return
			const { account, positions, network } = action.payload
			const wallet = findWalletForAccount(futuresState, account, network)
			if (wallet) {
				updateCrossMarginAccount(futuresState, network, wallet, { positions })
			}
		})
		builder.addCase(fetchCrossMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.perpsV3Positions = {
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

		// Fetch Cross Margin Trade Preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.perpsV3TradePreview = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, { payload }) => {
			futuresState.previews[payload.type] = payload.preview
			futuresState.queryStatuses.perpsV3TradePreview = SUCCESS_STATUS
		})

		// Fetch cross margin account
		builder.addCase(fetchSmartMarginAccount.pending, (futuresState) => {
			futuresState.queryStatuses.perpsV3Account = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginAccount.fulfilled, (futuresState, action) => {
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
			futuresState.queryStatuses.perpsV3Account = SUCCESS_STATUS
		})
		builder.addCase(fetchSmartMarginAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.perpsV3Account = {
				status: FetchStatus.Error,
				error: 'Failed to fetch account',
			}
		})

		// Fetch position history
		builder.addCase(fetchPerpsV3PositionHistory.pending, (futuresState) => {
			futuresState.queryStatuses.positionHistory = LOADING_STATUS
		})
		builder.addCase(fetchPerpsV3PositionHistory.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.positionHistory = SUCCESS_STATUS
			if (payload) {
				const { history: positionHistory, networkId, wallet } = payload
				updateCrossMarginAccount(futuresState, networkId, wallet, {
					positionHistory,
				})
			}
		})
		builder.addCase(fetchPerpsV3PositionHistory.rejected, (futuresState) => {
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

export default futuresSlice.reducer

export const {
	handlePreviewError,
	setMarketAsset,
	setClosePositionSizeDelta,
	setLeverageSide,
	setLeverageInput,
	clearAllTradePreviews,
	setSelectedTrader,
	setSelectedInputDenomination,
	setSelectedInputFundingRateHour,
	setSelectedPortfolioTimeframe,
	setTradePanelDrawerOpen,
	setShowTradeHistory,
	setSelectedChart,
	setPerpsV3Account,
} = futuresSlice.actions

const findWalletForAccount = (perpsV3State: PerpsV3State, account: string, network: NetworkId) => {
	const entry = Object.entries(perpsV3State.accounts[network]).find(([_, value]) => {
		return value.account === account
	})
	return entry ? entry[0] : undefined
}

const mergeTradesForAccount = (
	perpsV3: PerpsV3State,
	network: NetworkId,
	wallet: string,
	trades: FuturesTrade<string>[]
) => {
	const existingTrades = perpsV3.accounts[network]?.[wallet]?.trades ?? []
	trades.forEach((t) => {
		if (!existingTrades.find((et) => et.txnHash === t.txnHash)) {
			existingTrades.push(t)
		}
	})
	existingTrades.sort((a, b) => b.timestamp - a.timestamp)
	updateCrossMarginAccount(perpsV3, network, wallet, {
		trades: trades,
	})
}

const updateCrossMarginAccount = (
	futuresState: PerpsV3State,
	network: NetworkId,
	wallet: string,
	newAccountData: Partial<PerpsV3AccountData>
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
