import { Period } from '@kwenta/sdk/constants'
import {
	NetworkId,
	SmartMarginOrderType,
	FuturesAccountType,
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
	ZERO_STATE_ISOLATED_ACCOUNT,
	ZERO_STATE_TRADE_INPUTS,
} from 'state/constants'
import { accountType } from 'state/helpers'
import { FetchStatus } from 'state/types'

import {
	fetchCrossMarginBalanceInfo,
	fetchCrossMarginPositions,
	fetchIsolatedMarginPositions,
	fetchMarkets,
	fetchDailyVolumes,
	refetchPosition,
	fetchCrossMarginOpenOrders,
	fetchIsolatedMarginTradePreview,
	fetchCrossMarginTradePreview,
	fetchCrossMarginAccount,
	fetchFuturesPositionHistory,
	fetchPositionHistoryForTrader,
	fetchTradesForSelectedMarket,
	fetchAllTradesForAccount,
	fetchIsolatedOpenOrders,
	fetchMarginTransfers,
	fetchCombinedMarginTransfers,
	fetchFundingRatesHistory,
	fetchFuturesFees,
	fetchFuturesFeesForAccount,
} from './actions'
import {
	CrossMarginAccountData,
	CrossMarginState,
	CrossMarginTradeFees,
	EditPositionInputs,
	InputCurrencyDenomination,
	IsolatedAccountData,
	TradeSizeInputs,
	FuturesState,
	TransactionEstimationPayload,
	TransactionEstimations,
	PreviewAction,
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
		crossMarginBalanceInfo: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		crossMarginPositions: DEFAULT_QUERY_STATUS,
		crossMarginPositionHistory: DEFAULT_QUERY_STATUS,
		isolatedPositions: DEFAULT_QUERY_STATUS,
		isolatedPositionHistory: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		isolatedTradePreview: DEFAULT_QUERY_STATUS,
		crossMarginTradePreview: DEFAULT_QUERY_STATUS,
		crossMarginAccount: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		historicalFundingRates: DEFAULT_QUERY_STATUS,
		futuresFees: DEFAULT_QUERY_STATUS,
		futuresFeesForAccount: DEFAULT_QUERY_STATUS,
	},
	transactionEstimations: {} as TransactionEstimations,
	crossMargin: {
		accounts: DEFAULT_MAP_BY_NETWORK,
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETHPERP,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		orderFeeCap: '0',
		leverageInput: '0',
		selectedLeverageByAsset: {},
		showCrossMarginOnboard: false,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		sltpModalInputs: {
			stopLossPrice: '',
			takeProfitPrice: '',
		},
		editPositionInputs: {
			nativeSizeDelta: '',
			marginDelta: '',
		},
		closePositionOrderInputs: {
			orderType: 'market',
			nativeSizeDelta: '',
			price: {
				value: '',
				invalidLabel: undefined,
			},
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
	isolatedMargin: {
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
			orderType: 'market',
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
	},
	tradePanelDrawerOpen: false,
	historicalFundingRatePeriod: Period.TWO_WEEKS,
	historicalFundingRates: {},
	futuresFees: '0',
	futuresFeesForAccount: '0',
}

const futuresSlice = createSlice({
	name: 'futures',
	initialState: FUTURES_INITIAL_STATE,
	reducers: {
		setMarketAsset: (state, action) => {
			state[accountType(state.selectedType)].selectedMarketAsset = action.payload
			state[accountType(state.selectedType)].selectedMarketKey =
				MarketKeyByAsset[action.payload as FuturesMarketAsset]
			state[accountType(state.selectedType)].tradeInputs = ZERO_STATE_TRADE_INPUTS
			state[accountType(state.selectedType)].selectedMarketAsset = action.payload
		},
		setOrderType: (state, action: PayloadAction<FuturesOrderType>) => {
			state[accountType(state.selectedType)].orderType = action.payload
		},
		setClosePositionOrderType: (state, action: PayloadAction<SmartMarginOrderType>) => {
			state.crossMargin.closePositionOrderInputs.orderType = action.payload
		},
		setClosePositionSizeDelta: (state, action: PayloadAction<string>) => {
			if (state.selectedType === 'cross_margin') {
				state.crossMargin.closePositionOrderInputs.nativeSizeDelta = action.payload
			} else {
				state.isolatedMargin.closePositionOrderInputs.nativeSizeDelta = action.payload
			}
		},
		setClosePositionPrice: (
			state,
			action: PayloadAction<{ value: string; invalidLabel: string | null | undefined }>
		) => {
			state.crossMargin.closePositionOrderInputs.price = action.payload
		},
		setOrderFeeCap: (state, action) => {
			state.crossMargin.orderFeeCap = action.payload
		},
		setLeverageSide: (state, action) => {
			state[accountType(state.selectedType)].leverageSide = action.payload
		},
		setCrossMarginLeverageForAsset: (
			state,
			action: PayloadAction<{ marketKey: FuturesMarketKey; leverage: string }>
		) => {
			state.crossMargin.selectedLeverageByAsset[action.payload.marketKey] = action.payload.leverage
		},
		setCrossMarginMarginDelta: (state, action: PayloadAction<string>) => {
			state.crossMargin.marginDelta = action.payload
		},
		setCrossMarginTradeStopLoss: (state, action: PayloadAction<string>) => {
			state.crossMargin.tradeInputs.stopLossPrice = action.payload
		},
		setCrossMarginTradeTakeProfit: (state, action: PayloadAction<string>) => {
			state.crossMargin.tradeInputs.takeProfitPrice = action.payload
		},
		setSLTPModalStopLoss: (state, action: PayloadAction<string>) => {
			state.crossMargin.sltpModalInputs.stopLossPrice = action.payload
		},
		setSLTPModalTakeProfit: (state, action: PayloadAction<string>) => {
			state.crossMargin.sltpModalInputs.takeProfitPrice = action.payload
		},
		setFuturesAccountType: (state, action) => {
			state.selectedType = action.payload
		},
		setCrossMarginTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
			state.crossMargin.tradeInputs = action.payload
		},
		setCrossMarginEditPositionInputs: (
			state,
			action: PayloadAction<EditPositionInputs<string>>
		) => {
			state.crossMargin.editPositionInputs = action.payload
		},
		setCrossMarginOrderPrice: (state, action: PayloadAction<string>) => {
			state.crossMargin.orderPrice.price = action.payload
		},
		setCrossMarginOrderPriceInvalidLabel: (
			state,
			action: PayloadAction<string | null | undefined>
		) => {
			state.crossMargin.orderPrice.invalidLabel = action.payload
		},
		setIsolatedMarginTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
			state.isolatedMargin.tradeInputs = action.payload
		},
		setIsolatedMarginEditPositionInputs: (
			state,
			action: PayloadAction<EditPositionInputs<string>>
		) => {
			state.isolatedMargin.editPositionInputs = action.payload
		},
		setSelectedInputDenomination: (state, action: PayloadAction<InputCurrencyDenomination>) => {
			state.selectedInputDenomination = action.payload
		},
		setSelectedInputFundingRateHour: (state, action: PayloadAction<number>) => {
			state.selectedInputHours = action.payload
		},
		setIsolatedMarginFee: (state, action: PayloadAction<string>) => {
			state.isolatedMargin.tradeFee = action.payload
		},
		setLeverageInput: (state, action: PayloadAction<string>) => {
			state[accountType(state.selectedType)].leverageInput = action.payload
		},
		setCrossMarginFees: (state, action: PayloadAction<CrossMarginTradeFees<string>>) => {
			state.crossMargin.fees = action.payload
		},
		setKeeperDeposit: (state, action: PayloadAction<string>) => {
			state.crossMargin.fees.keeperEthDeposit = action.payload
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
			const selectedAccountType = futuresState.selectedType
			const message = Object.values(ORDER_PREVIEW_ERRORS).includes(payload.error)
				? payload.error
				: 'Failed to get trade preview'
			futuresState.queryStatuses.crossMarginTradePreview = {
				status: FetchStatus.Error,
				error: message,
			}
			futuresState[accountType(selectedAccountType)].previews[payload.previewType] = null
		},

		setCrossMarginAccount: (
			state,
			action: PayloadAction<{ wallet: string; account: string; network: NetworkId }>
		) => {
			const { account, wallet, network } = action.payload
			if (!state.crossMargin.accounts[network]?.[wallet]?.account) {
				state.crossMargin.accounts[network] = {
					...state.crossMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				}
			}
		},
		setTransactionEstimate: (state, action: PayloadAction<TransactionEstimationPayload>) => {
			state.transactionEstimations[action.payload.type] = {
				limit: action.payload.limit,
				cost: action.payload.cost,
				error: action.payload.error,
			}
		},
		setIsolatedTradePreview: (
			state,
			{
				payload,
			}: PayloadAction<{
				preview: FuturesPotentialTradeDetails<string> | null
				type: PreviewAction
			}>
		) => {
			state.isolatedMargin.previews[payload.type] = payload.preview
		},
		clearAllTradePreviews: (state) => {
			state.isolatedMargin.previews = {
				edit: null,
				trade: null,
				close: null,
			}
			state.crossMargin.previews = {
				edit: null,
				trade: null,
				close: null,
			}
			state.queryStatuses.isolatedTradePreview = DEFAULT_QUERY_STATUS
			state.queryStatuses.crossMarginTradePreview = DEFAULT_QUERY_STATUS
		},
		setCrossMarginTradePreview: (
			state,
			{
				payload,
			}: PayloadAction<{
				preview: FuturesPotentialTradeDetails<string> | null
				type: PreviewAction
			}>
		) => {
			state.crossMargin.previews[payload.type] = payload.preview
		},
		setCrossMarginOrderCancelling: (state, { payload }: PayloadAction<number | undefined>) => {
			state.crossMargin.cancellingOrder = payload
		},
		setSelectedTrader: (
			state,
			action: PayloadAction<{ trader: string; traderEns?: string | null } | undefined>
		) => {
			state.leaderboard.selectedTrader = action.payload
		},
		incrementIsolatedPreviewCount: (state) => {
			state.isolatedMargin.previewDebounceCount = state.isolatedMargin.previewDebounceCount + 1
		},
		incrementCrossPreviewCount: (state) => {
			state.crossMargin.previewDebounceCount = state.crossMargin.previewDebounceCount + 1
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

		// Cross margin overview
		builder.addCase(fetchCrossMarginBalanceInfo.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginBalanceInfo.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = SUCCESS_STATUS
			if (action.payload) {
				const { account, network, balanceInfo } = action.payload
				const wallet = findWalletForAccount(futuresState.crossMargin, account, network)
				if (wallet) {
					updateFuturesAccount(futuresState, 'cross_margin', network, wallet, { balanceInfo })
				}
			}
		})
		builder.addCase(fetchCrossMarginBalanceInfo.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = {
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
				const newAccountData =
					context.type === 'isolated_margin'
						? { marginTransfers }
						: {
								marginTransfers,
								idleTransfers,
						  }
				updateFuturesAccount(
					futuresState,
					context.type,
					context.network,
					context.wallet,
					newAccountData
				)
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
				const { context, isolatedMarginTransfers, smartMarginTransfers, idleTransfers } = payload
				const newIsolatedAccountData = { marginTransfers: isolatedMarginTransfers }
				const newSmartAccountData = {
					marginTransfers: smartMarginTransfers,
					idleTransfers,
				}

				updateFuturesAccount(
					futuresState,
					'isolated_margin',
					context.network,
					context.wallet,
					newIsolatedAccountData
				)

				updateFuturesAccount(
					futuresState,
					'smart_margin',
					context.network,
					context.wallet,
					newSmartAccountData
				)
			}
		})
		builder.addCase(fetchCombinedMarginTransfers.rejected, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = {
				status: FetchStatus.Error,
				error: 'Failed to fetch combined margin transfers',
			}
		})

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginPositions = SUCCESS_STATUS
			if (!action.payload) return
			const { account, positions, network } = action.payload
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network)
			if (wallet) {
				updateFuturesAccount(futuresState, 'cross_margin', network, wallet, { positions })
			}
		})
		builder.addCase(fetchCrossMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			}
		})

		// Isolated margin positions
		builder.addCase(fetchIsolatedMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = LOADING_STATUS
		})
		builder.addCase(fetchIsolatedMarginPositions.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.isolatedPositions = SUCCESS_STATUS
			if (payload) {
				const { positions, wallet, network } = payload
				updateFuturesAccount(futuresState, 'isolated_margin', network, wallet, { positions })
			}
		})
		builder.addCase(fetchIsolatedMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			}
		})

		// Refetch selected position
		builder.addCase(refetchPosition.fulfilled, (futuresState, { payload }) => {
			if (payload) {
				const { position, wallet, networkId } = payload
				const account = futuresState.isolatedMargin.accounts[networkId]?.[wallet]

				const existingPositions = account?.positions ?? []
				const index = existingPositions.findIndex((p) => p.marketKey === position.marketKey)
				existingPositions[index] = position
				futuresState.isolatedMargin.accounts[networkId][wallet] = {
					...account,
					positions: existingPositions,
				}
			}
		})

		// Fetch Cross Margin Open Orders
		builder.addCase(fetchCrossMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginOpenOrders.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS
			if (!action.payload) return
			const { network, account, delayedOrders, conditionalOrders } = action.payload
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network)
			if (wallet) {
				updateFuturesAccount(futuresState, 'cross_margin', network, wallet, {
					conditionalOrders,
					delayedOrders,
				})
			}
		})
		builder.addCase(fetchCrossMarginOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for cross margin account',
			}
		})

		// Fetch Isolated Open Orders
		builder.addCase(fetchIsolatedOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchIsolatedOpenOrders.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS
			if (payload) {
				const { orders: delayedOrders, wallet, networkId } = payload
				updateFuturesAccount(futuresState, 'isolated_margin', networkId, wallet, {
					delayedOrders,
				})
			}
		})
		builder.addCase(fetchIsolatedOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for isolated margin',
			}
		})

		// Fetch Isolated Margin Trade Preview
		builder.addCase(fetchIsolatedMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = LOADING_STATUS
		})
		builder.addCase(fetchIsolatedMarginTradePreview.fulfilled, (futuresState, { payload }) => {
			futuresState.isolatedMargin.previews[payload.type] = payload.preview
			futuresState.queryStatuses.isolatedTradePreview = SUCCESS_STATUS
		})
		builder.addCase(fetchIsolatedMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = {
				status: FetchStatus.Error,
				error: 'Failed to fetch trade preview',
			}
			futuresState.isolatedMargin.previews.trade = null
		})

		// Fetch Cross Margin Trade Preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, { payload }) => {
			futuresState.crossMargin.previews[payload.type] = payload.preview
			futuresState.queryStatuses.crossMarginTradePreview = SUCCESS_STATUS
		})

		// Fetch cross margin account
		builder.addCase(fetchCrossMarginAccount.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginAccount = LOADING_STATUS
		})
		builder.addCase(fetchCrossMarginAccount.fulfilled, (futuresState, action) => {
			if (action.payload) {
				const { network, account, wallet } = action.payload
				futuresState.crossMargin.accounts[network] = {
					...futuresState.crossMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_CM_ACCOUNT,
					},
				}
			}
			futuresState.queryStatuses.crossMarginAccount = SUCCESS_STATUS
		})
		builder.addCase(fetchCrossMarginAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginAccount = {
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
				updateFuturesAccount(futuresState, type, networkId, wallet, {
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
				const { accountType: type, trades, networkId, wallet } = payload
				mergeTradesForAccount(futuresState, type, networkId, wallet, trades)
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
				const { accountType: type, trades, networkId, wallet } = payload
				mergeTradesForAccount(futuresState, type, networkId, wallet, trades)
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

		// Trading Fees by given epoch
		builder.addCase(fetchFuturesFees.pending, (futuresState) => {
			futuresState.queryStatuses.futuresFees = LOADING_STATUS
		})
		builder.addCase(fetchFuturesFees.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.futuresFees = SUCCESS_STATUS
			futuresState.futuresFees = action.payload.totalFuturesFeePaid
		})
		builder.addCase(fetchFuturesFees.rejected, (futuresState) => {
			futuresState.queryStatuses.futuresFees = {
				status: FetchStatus.Error,
				error: 'Failed to fetch fee data',
			}
		})

		// Trading Fees by given epoch and trader
		builder.addCase(fetchFuturesFeesForAccount.pending, (futuresState) => {
			futuresState.queryStatuses.futuresFeesForAccount = LOADING_STATUS
		})
		builder.addCase(fetchFuturesFeesForAccount.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.futuresFeesForAccount = SUCCESS_STATUS
			futuresState.futuresFeesForAccount = action.payload.futuresFeePaid
		})
		builder.addCase(fetchFuturesFeesForAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.futuresFeesForAccount = {
				status: FetchStatus.Error,
				error: 'Failed to fetch fee data for the account',
			}
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
	setCrossMarginTradeInputs,
	setCrossMarginAccount,
	setCrossMarginMarginDelta,
	setCrossMarginTradeStopLoss,
	setCrossMarginTradeTakeProfit,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setTransactionEstimate,
	setLeverageInput,
	setCrossMarginFees,
	setKeeperDeposit,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	clearAllTradePreviews,
	setIsolatedMarginFee,
	setCrossMarginTradePreview,
	setCrossMarginLeverageForAsset,
	setCrossMarginOrderCancelling,
	setSelectedTrader,
	setSelectedInputDenomination,
	setSelectedInputFundingRateHour,
	setCrossMarginEditPositionInputs,
	setIsolatedMarginEditPositionInputs,
	incrementIsolatedPreviewCount,
	incrementCrossPreviewCount,
	setSelectedPortfolioTimeframe,
	setSLTPModalStopLoss,
	setSLTPModalTakeProfit,
	setTradePanelDrawerOpen,
	toggleShowTradeHistory,
	setSelectedChart,
	setHistoricalFundingRatePeriod,
} = futuresSlice.actions

const findWalletForAccount = (
	crossMarginState: CrossMarginState,
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
	type: FuturesAccountType,
	network: NetworkId,
	wallet: string,
	trades: FuturesTrade<string>[]
) => {
	const existingTrades = futuresState[accountType(type)].accounts[network]?.[wallet]?.trades ?? []
	trades.forEach((t) => {
		if (!existingTrades.find((et) => et.txnHash === t.txnHash)) {
			existingTrades.push(t)
		}
	})
	existingTrades.sort((a, b) => b.timestamp - a.timestamp)
	updateFuturesAccount(futuresState, type, network, wallet, {
		trades: trades,
	})
}

const updateFuturesAccount = (
	futuresState: FuturesState,
	type: FuturesAccountType,
	network: NetworkId,
	wallet: string,
	newAccountData: Partial<IsolatedAccountData | CrossMarginAccountData>
) => {
	const updatedAccount =
		type === 'isolated_margin'
			? {
					...ZERO_STATE_ISOLATED_ACCOUNT,
					...futuresState.isolatedMargin.accounts[network]?.[wallet],
					...newAccountData,
			  }
			: {
					...ZERO_STATE_CM_ACCOUNT,
					...futuresState.crossMargin.accounts[network]?.[wallet],
					...newAccountData,
			  }

	futuresState[accountType(type)].accounts[network] = {
		...futuresState[accountType(type)].accounts[network],
		[wallet]: updatedAccount,
	}
}
