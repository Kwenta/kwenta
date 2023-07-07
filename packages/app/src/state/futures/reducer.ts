import { Period } from '@kwenta/sdk/constants'
import {
	NetworkId,
	SmartMarginOrderType,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesPotentialTradeDetails,
	PositionSide,
	FuturesTrade,
	FuturesOrderType,
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
	ZERO_CM_FEES,
	ZERO_STATE_CM_ACCOUNT,
	ZERO_STATE_TRADE_INPUTS,
} from 'state/constants'
import { FetchStatus } from 'state/types'

import {
	fetchSmartMarginBalanceInfo,
	fetchSmartMarginPositions,
	fetchMarkets,
	fetchDailyVolumes,
	refetchPosition,
	fetchSmartMarginOpenOrders,
	fetchCrossMarginTradePreview,
	fetchSmartMarginAccount,
	fetchFuturesPositionHistory,
	fetchPositionHistoryForTrader,
	fetchTradesForSelectedMarket,
	fetchAllTradesForAccount,
	fetchMarginTransfers,
	fetchCombinedMarginTransfers,
	fetchFundingRatesHistory,
} from './actions'
import {
	SmartMarginAccountData,
	SmartMarginState,
	EditPositionInputs,
	InputCurrencyDenomination,
	TradeSizeInputs,
	FuturesState,
	PreviewAction,
	AppFuturesMarginType,
	SmartMarginTradeFees,
} from './types'

export const FUTURES_INITIAL_STATE: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	markets: {
		420: [],
		10: [],
	},
	dailyMarketVolumes: {},
	errors: {},
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
		smartMarginBalanceInfo: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		smartMarginPositions: DEFAULT_QUERY_STATUS,
		smartMarginPositionHistory: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		smartMarginTradePreview: DEFAULT_QUERY_STATUS,
		smartMarginAccount: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		historicalFundingRates: DEFAULT_QUERY_STATUS,
	},
	smartMargin: {
		accounts: DEFAULT_MAP_BY_NETWORK,
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETHPERP,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		orderFeeCap: '0',
		leverageInput: '0',
		selectedLeverageByAsset: {},
		showSmartMarginOnboard: false,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		sltpModalInputs: {
			stopLossPrice: '',
			takeProfitPrice: '',
		},
		editPositionInputs: {
			nativeSizeDelta: '',
			marginDelta: '',
		},
		fees: ZERO_CM_FEES,
		previews: {
			trade: null,
			close: null,
			edit: null,
		},
		previewDebounceCount: 0,
		marginDelta: '0',
		cancellingOrder: undefined,
		depositApproved: false,
		orderPrice: {
			price: undefined,
			invalidLabel: undefined,
		},
	},
	tradePanelDrawerOpen: false,
	historicalFundingRates: {},
	closePositionOrderInputs: {
		orderType: 'market',
		nativeSizeDelta: '',
		price: {
			value: '',
			invalidLabel: undefined,
		},
	},
}

const futuresSlice = createSlice({
	name: 'futures',
	initialState: FUTURES_INITIAL_STATE,
	reducers: {
		setMarketAsset: (state, action) => {
			state.smartMargin.selectedMarketAsset = action.payload
			state.smartMargin.selectedMarketKey = MarketKeyByAsset[action.payload as FuturesMarketAsset]
			state.smartMargin.tradeInputs = ZERO_STATE_TRADE_INPUTS
			state.smartMargin.selectedMarketAsset = action.payload
		},
		setOrderType: (state, action: PayloadAction<FuturesOrderType>) => {
			state.smartMargin.orderType = action.payload
		},
		setClosePositionOrderType: (state, action: PayloadAction<SmartMarginOrderType>) => {
			state.closePositionOrderInputs.orderType = action.payload
		},
		setClosePositionSizeDelta: (state, action: PayloadAction<string>) => {
			state.closePositionOrderInputs.nativeSizeDelta = action.payload
		},
		setClosePositionPrice: (
			state,
			action: PayloadAction<{ value: string; invalidLabel: string | null | undefined }>
		) => {
			state.closePositionOrderInputs.price = action.payload
		},
		setOrderFeeCap: (state, action) => {
			state.smartMargin.orderFeeCap = action.payload
		},
		setLeverageSide: (state, action) => {
			state.smartMargin.leverageSide = action.payload
		},
		setSmartMarginMarginDelta: (state, action: PayloadAction<string>) => {
			state.smartMargin.marginDelta = action.payload
		},
		setSmartMarginTradeStopLoss: (state, action: PayloadAction<string>) => {
			state.smartMargin.tradeInputs.stopLossPrice = action.payload
		},
		setSmartMarginTradeTakeProfit: (state, action: PayloadAction<string>) => {
			state.smartMargin.tradeInputs.takeProfitPrice = action.payload
		},
		setSLTPModalStopLoss: (state, action: PayloadAction<string>) => {
			state.smartMargin.sltpModalInputs.stopLossPrice = action.payload
		},
		setSLTPModalTakeProfit: (state, action: PayloadAction<string>) => {
			state.smartMargin.sltpModalInputs.takeProfitPrice = action.payload
		},
		setFuturesAccountType: (state, action: PayloadAction<AppFuturesMarginType>) => {
			state.selectedType = action.payload
		},
		setSmartMarginTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
			state.smartMargin.tradeInputs = action.payload
		},
		setSmartMarginEditPositionInputs: (
			state,
			action: PayloadAction<EditPositionInputs<string>>
		) => {
			state.smartMargin.editPositionInputs = action.payload
		},
		setSmartMarginOrderPrice: (state, action: PayloadAction<string>) => {
			state.smartMargin.orderPrice.price = action.payload
		},
		setSmartMarginOrderPriceInvalidLabel: (
			state,
			action: PayloadAction<string | null | undefined>
		) => {
			state.smartMargin.orderPrice.invalidLabel = action.payload
		},
		setSelectedInputDenomination: (state, action: PayloadAction<InputCurrencyDenomination>) => {
			state.selectedInputDenomination = action.payload
		},
		setSelectedInputFundingRateHour: (state, action: PayloadAction<number>) => {
			state.selectedInputHours = action.payload
		},
		setLeverageInput: (state, action: PayloadAction<string>) => {
			state.smartMargin.leverageInput = action.payload
		},
		setSmartMarginFees: (state, action: PayloadAction<SmartMarginTradeFees<string>>) => {
			state.smartMargin.fees = action.payload
		},
		setKeeperDeposit: (state, action: PayloadAction<string>) => {
			state.smartMargin.fees.keeperEthDeposit = action.payload
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
			futuresState.queryStatuses.smartMarginTradePreview = {
				status: FetchStatus.Error,
				error: message,
			}
			futuresState.smartMargin.previews[payload.previewType] = null
		},

		setSmartMarginAccount: (
			state,
			action: PayloadAction<{ wallet: string; account: string; network: NetworkId }>
		) => {
			const { account, wallet, network } = action.payload
			if (!state.smartMargin.accounts[network]?.[wallet]?.account) {
				state.smartMargin.accounts[network] = {
					...state.smartMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				}
			}
		},
		clearAllTradePreviews: (state) => {
			state.smartMargin.previews = {
				edit: null,
				trade: null,
				close: null,
			}
			state.queryStatuses.smartMarginTradePreview = DEFAULT_QUERY_STATUS
		},
		setSmartMarginTradePreview: (
			state,
			{
				payload,
			}: PayloadAction<{
				preview: FuturesPotentialTradeDetails<string> | null
				type: PreviewAction
			}>
		) => {
			state.smartMargin.previews[payload.type] = payload.preview
		},
		setSmartMarginOrderCancelling: (state, { payload }: PayloadAction<number | undefined>) => {
			state.smartMargin.cancellingOrder = payload
		},
		setSelectedTrader: (state, action: PayloadAction<string | undefined>) => {
			state.leaderboard.selectedTrader = action.payload
		},
		incrementCrossPreviewCount: (state) => {
			state.smartMargin.previewDebounceCount = state.smartMargin.previewDebounceCount + 1
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
		builder.addCase(fetchMarkets.pending, (futuresState) => {
			futuresState.queryStatuses.markets = LOADING_STATUS
		})
		builder.addCase(fetchMarkets.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.markets = SUCCESS_STATUS
			if (payload) {
				futuresState.markets[payload.networkId] = payload.markets
			}
		})
		builder.addCase(fetchMarkets.rejected, (futuresState) => {
			futuresState.queryStatuses.markets = {
				status: FetchStatus.Error,
				error: 'Failed to fetch markets',
			}
		})

		// Smart margin overview
		builder.addCase(fetchSmartMarginBalanceInfo.pending, (futuresState) => {
			futuresState.queryStatuses.smartMarginBalanceInfo = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginBalanceInfo.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.smartMarginBalanceInfo = SUCCESS_STATUS
			if (action.payload) {
				const { account, network, balanceInfo } = action.payload
				const wallet = findWalletForAccount(futuresState.smartMargin, account, network)
				if (wallet) {
					updateSmartMarginAccount(futuresState, network, wallet, { balanceInfo })
				}
			}
		})
		builder.addCase(fetchSmartMarginBalanceInfo.rejected, (futuresState) => {
			futuresState.queryStatuses.smartMarginBalanceInfo = {
				status: FetchStatus.Error,
				error: 'Failed to fetch balance info',
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
				const { context, marginTransfers, idleTransfers } = payload
				const newAccountData = {
					marginTransfers,
					idleTransfers,
				}
				updateSmartMarginAccount(futuresState, context.network, context.wallet, newAccountData)
			}
		})
		builder.addCase(fetchMarginTransfers.rejected, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = {
				status: FetchStatus.Error,
				error: 'Failed to fetch margin transfers',
			}
		})

		// combined margin transfers
		builder.addCase(fetchCombinedMarginTransfers.pending, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = LOADING_STATUS
		})
		builder.addCase(fetchCombinedMarginTransfers.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.marginTransfers = SUCCESS_STATUS
			if (payload) {
				const { context, smartMarginTransfers, idleTransfers } = payload
				const newSmartAccountData = {
					marginTransfers: smartMarginTransfers,
					idleTransfers,
				}

				updateSmartMarginAccount(futuresState, context.network, context.wallet, newSmartAccountData)
			}
		})
		builder.addCase(fetchCombinedMarginTransfers.rejected, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = {
				status: FetchStatus.Error,
				error: 'Failed to fetch combined margin transfers',
			}
		})

		// Cross margin positions
		builder.addCase(fetchSmartMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.smartMarginPositions = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.smartMarginPositions = SUCCESS_STATUS
			if (!action.payload) return
			const { account, positions, network } = action.payload
			const wallet = findWalletForAccount(futuresState.smartMargin, account, network)
			if (wallet) {
				updateSmartMarginAccount(futuresState, network, wallet, { positions })
			}
		})
		builder.addCase(fetchSmartMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.smartMarginPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			}
		})

		// Refetch selected position
		builder.addCase(refetchPosition.fulfilled, (futuresState, { payload }) => {
			if (payload) {
				const { position, wallet, networkId } = payload
				const account = futuresState.smartMargin.accounts[networkId]?.[wallet]

				const existingPositions = account?.positions ?? []
				const index = existingPositions.findIndex((p) => p.marketKey === position.marketKey)
				existingPositions[index] = position
				futuresState.smartMargin.accounts[networkId][wallet] = {
					...account,
					positions: existingPositions,
				}
			}
		})

		// Fetch Cross Margin Open Orders
		builder.addCase(fetchSmartMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginOpenOrders.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS
			if (!action.payload) return
			const { network, account, delayedOrders, conditionalOrders } = action.payload
			const wallet = findWalletForAccount(futuresState.smartMargin, account, network)
			if (wallet) {
				updateSmartMarginAccount(futuresState, network, wallet, {
					conditionalOrders,
					delayedOrders,
				})
			}
		})
		builder.addCase(fetchSmartMarginOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for cross margin account',
			}
		})

		// Fetch Cross Margin Trade Preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.smartMarginTradePreview = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, { payload }) => {
			futuresState.smartMargin.previews[payload.type] = payload.preview
			futuresState.queryStatuses.smartMarginTradePreview = SUCCESS_STATUS
		})

		// Fetch cross margin account
		builder.addCase(fetchSmartMarginAccount.pending, (futuresState) => {
			futuresState.queryStatuses.smartMarginAccount = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginAccount.fulfilled, (futuresState, action) => {
			if (action.payload) {
				const { network, account, wallet } = action.payload
				futuresState.smartMargin.accounts[network] = {
					...futuresState.smartMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				}
			}
			futuresState.queryStatuses.smartMarginAccount = SUCCESS_STATUS
		})
		builder.addCase(fetchSmartMarginAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.smartMarginAccount = {
				status: FetchStatus.Error,
				error: 'Failed to fetch cross margin account',
			}
		})

		// Fetch position history
		builder.addCase(fetchFuturesPositionHistory.pending, (futuresState) => {
			futuresState.queryStatuses.positionHistory = LOADING_STATUS
		})
		builder.addCase(fetchFuturesPositionHistory.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.positionHistory = SUCCESS_STATUS
			if (payload) {
				const { accountType: type, history: positionHistory, networkId, wallet } = payload
				updateSmartMarginAccount(futuresState, networkId, wallet, {
					positionHistory,
				})
			}
		})
		builder.addCase(fetchFuturesPositionHistory.rejected, (futuresState) => {
			futuresState.queryStatuses.positionHistory = {
				error: 'Failed to fetch position history',
				status: FetchStatus.Error,
			}
		})

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

		// Fetch trades for market
		builder.addCase(fetchTradesForSelectedMarket.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS
		})
		builder.addCase(fetchTradesForSelectedMarket.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS
			if (payload) {
				const { trades, networkId, wallet } = payload
				mergeTradesForAccount(futuresState, networkId, wallet, trades)
			}
		})
		builder.addCase(fetchTradesForSelectedMarket.rejected, (futuresState) => {
			futuresState.queryStatuses.trades = {
				error: 'Failed to fetch trades',
				status: FetchStatus.Error,
			}
		})

		// TODO: Combine all with market trades rather than overwrite as the filter is done on selector

		// Fetch all trades for account
		builder.addCase(fetchAllTradesForAccount.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS
		})
		builder.addCase(fetchAllTradesForAccount.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS
			if (payload) {
				const { trades, networkId, wallet } = payload
				mergeTradesForAccount(futuresState, networkId, wallet, trades)
			}
		})
		builder.addCase(fetchAllTradesForAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.trades = {
				error: 'Failed to fetch trades',
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
	setOrderType,
	setClosePositionOrderType,
	setClosePositionSizeDelta,
	setClosePositionPrice,
	setOrderFeeCap,
	setLeverageSide,
	setFuturesAccountType,
	setSmartMarginTradeInputs,
	setSmartMarginAccount,
	setSmartMarginMarginDelta,
	setSmartMarginTradeStopLoss,
	setSmartMarginTradeTakeProfit,
	setSmartMarginOrderPrice,
	setSmartMarginOrderPriceInvalidLabel,
	setLeverageInput,
	setSmartMarginFees,
	setKeeperDeposit,
	clearAllTradePreviews,
	setSmartMarginTradePreview,
	setSmartMarginOrderCancelling,
	setSelectedTrader,
	setSelectedInputDenomination,
	setSelectedInputFundingRateHour,
	setSmartMarginEditPositionInputs,
	incrementCrossPreviewCount,
	setSelectedPortfolioTimeframe,
	setSLTPModalStopLoss,
	setSLTPModalTakeProfit,
	setTradePanelDrawerOpen,
	setShowTradeHistory,
	setSelectedChart,
} = futuresSlice.actions

const findWalletForAccount = (
	crossMarginState: SmartMarginState,
	account: string,
	network: NetworkId
) => {
	const entry = Object.entries(crossMarginState.accounts[network]).find(([_, value]) => {
		return value.account === account
	})
	return entry ? entry[0] : undefined
}

const mergeTradesForAccount = (
	futuresState: FuturesState,
	network: NetworkId,
	wallet: string,
	trades: FuturesTrade<string>[]
) => {
	const existingTrades = futuresState.smartMargin.accounts[network]?.[wallet]?.trades ?? []
	trades.forEach((t) => {
		if (!existingTrades.find((et) => et.txnHash === t.txnHash)) {
			existingTrades.push(t)
		}
	})
	existingTrades.sort((a, b) => b.timestamp - a.timestamp)
	updateSmartMarginAccount(futuresState, network, wallet, {
		trades: trades,
	})
}

export const updateSmartMarginAccount = (
	futuresState: FuturesState,
	network: NetworkId,
	wallet: string,
	newAccountData: Partial<SmartMarginAccountData>
) => {
	const updatedAccount = {
		...ZERO_STATE_CM_ACCOUNT,
		...futuresState.smartMargin.accounts[network]?.[wallet],
		...newAccountData,
	}

	futuresState.smartMargin.accounts[network] = {
		...futuresState.smartMargin.accounts[network],
		[wallet]: updatedAccount,
	}
}
