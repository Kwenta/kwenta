import {
	NetworkId,
	SmartMarginOrderType,
	FuturesMarketAsset,
	FuturesPotentialTradeDetails,
	PositionSide,
	FuturesTrade,
	FuturesOrderType,
} from '@kwenta/sdk/types'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { ORDER_PREVIEW_ERRORS } from 'queries/futures/constants'
import {
	DEFAULT_MAP_BY_NETWORK,
	DEFAULT_QUERY_STATUS,
	LOADING_STATUS,
	SUCCESS_STATUS,
	ZERO_CM_FEES,
	ZERO_STATE_ACCOUNT,
	ZERO_STATE_TRADE_INPUTS,
} from 'state/constants'
import { FetchStatus } from 'state/types'

import { PreviewAction } from '../common/types'

import {
	fetchSmartMarginBalanceInfo,
	fetchSmartMarginPositions,
	fetchMarketsV2,
	fetchDailyVolumesV2,
	refetchSmartMarginPosition,
	fetchSmartMarginOpenOrders,
	fetchSmartMarginTradePreview,
	fetchSmartMarginAccount,
	fetchPositionHistoryV2,
	fetchTradesForSelectedMarket,
	fetchAllV2TradesForAccount,
	fetchMarginTransfersV2,
	fetchFundingRatesHistory,
	fetchFuturesFees,
	fetchFuturesFeesForAccount,
} from './actions'
import {
	SmartMarginAccountData,
	SmartMarginState,
	EditPositionInputs,
	SmartMarginTradeFees,
	SmartMarginTradeInputs,
} from './types'

export const SMART_MARGIN_INITIAL_STATE: SmartMarginState = {
	markets: {
		420: [],
		10: [],
	},
	dailyMarketVolumes: {},
	fundingRates: [],
	queryStatuses: {
		markets: DEFAULT_QUERY_STATUS,
		smartMarginBalanceInfo: DEFAULT_QUERY_STATUS,
		dailyVolumes: DEFAULT_QUERY_STATUS,
		positions: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		openOrders: DEFAULT_QUERY_STATUS,
		tradePreview: DEFAULT_QUERY_STATUS,
		account: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		historicalFundingRates: DEFAULT_QUERY_STATUS,
		futuresFees: DEFAULT_QUERY_STATUS,
		futuresFeesForAccount: DEFAULT_QUERY_STATUS,
	},
	accounts: DEFAULT_MAP_BY_NETWORK,
	selectedMarketAsset: FuturesMarketAsset.sETH,
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
	historicalFundingRates: {},
	closePositionOrderInputs: {
		orderType: 'market',
		nativeSizeDelta: '',
		price: {
			value: '',
			invalidLabel: undefined,
		},
	},
	futuresFees: '0',
	futuresFeesForAccount: '0',
}

const smartMarginSlice = createSlice({
	name: 'smartMargin',
	initialState: SMART_MARGIN_INITIAL_STATE,
	reducers: {
		setMarketAsset: (smartMargin, action) => {
			smartMargin.selectedMarketAsset = action.payload
			smartMargin.tradeInputs = ZERO_STATE_TRADE_INPUTS
		},
		setOrderType: (smartMargin, action: PayloadAction<FuturesOrderType>) => {
			smartMargin.orderType = action.payload
		},
		setClosePositionOrderType: (smartMargin, action: PayloadAction<SmartMarginOrderType>) => {
			smartMargin.closePositionOrderInputs.orderType = action.payload
		},
		setClosePositionSizeDelta: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.closePositionOrderInputs.nativeSizeDelta = action.payload
		},
		setClosePositionPrice: (
			smartMargin,
			action: PayloadAction<{ value: string; invalidLabel: string | null | undefined }>
		) => {
			smartMargin.closePositionOrderInputs.price = action.payload
		},
		setOrderFeeCap: (smartMargin, action) => {
			smartMargin.orderFeeCap = action.payload
		},
		setLeverageSide: (smartMargin, action) => {
			smartMargin.leverageSide = action.payload
		},
		setSmartMarginMarginDelta: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.marginDelta = action.payload
		},
		setSmartMarginTradeStopLoss: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.tradeInputs.stopLossPrice = action.payload
		},
		setSmartMarginTradeTakeProfit: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.tradeInputs.takeProfitPrice = action.payload
		},
		setSLTPModalStopLoss: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.sltpModalInputs.stopLossPrice = action.payload
		},
		setSLTPModalTakeProfit: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.sltpModalInputs.takeProfitPrice = action.payload
		},
		setSmartMarginTradeInputs: (
			smartMargin,
			action: PayloadAction<SmartMarginTradeInputs<string>>
		) => {
			smartMargin.tradeInputs = action.payload
		},
		setSmartMarginEditPositionInputs: (
			smartMargin,
			action: PayloadAction<EditPositionInputs<string>>
		) => {
			smartMargin.editPositionInputs = action.payload
		},
		setSmartMarginOrderPrice: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.orderPrice.price = action.payload
		},
		setSmartMarginOrderPriceInvalidLabel: (
			smartMargin,
			action: PayloadAction<string | null | undefined>
		) => {
			smartMargin.orderPrice.invalidLabel = action.payload
		},
		setSmartMarginLeverageInput: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.leverageInput = action.payload
		},
		setSmartMarginFees: (smartMargin, action: PayloadAction<SmartMarginTradeFees<string>>) => {
			smartMargin.fees = action.payload
		},
		setKeeperDeposit: (smartMargin, action: PayloadAction<string>) => {
			smartMargin.fees.keeperEthDeposit = action.payload
		},
		handlePreviewError: (
			smartMargin,
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
			smartMargin.queryStatuses.tradePreview = {
				status: FetchStatus.Error,
				error: message,
			}
			smartMargin.previews[payload.previewType] = null
		},

		setSmartMarginAccount: (
			smartMargin,
			action: PayloadAction<{ wallet: string; account: string; network: NetworkId }>
		) => {
			const { account, wallet, network } = action.payload
			if (!smartMargin.accounts[network]?.[wallet]?.account) {
				smartMargin.accounts[network] = {
					...smartMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_ACCOUNT,
					},
				}
			}
		},
		clearSmartMarginTradePreviews: (smartMargin) => {
			smartMargin.previews = {
				edit: null,
				trade: null,
				close: null,
			}
			smartMargin.queryStatuses.tradePreview = DEFAULT_QUERY_STATUS
		},
		setSmartMarginTradePreview: (
			smartMargin,
			{
				payload,
			}: PayloadAction<{
				preview: FuturesPotentialTradeDetails<string> | null
				type: PreviewAction
			}>
		) => {
			smartMargin.previews[payload.type] = payload.preview
		},
		setSmartMarginOrderCancelling: (
			smartMargin,
			{ payload }: PayloadAction<number | undefined>
		) => {
			smartMargin.cancellingOrder = payload
		},
		incrementCrossPreviewCount: (smartMargin) => {
			smartMargin.previewDebounceCount = smartMargin.previewDebounceCount + 1
		},
	},
	extraReducers: (builder) => {
		// Markets
		builder.addCase(fetchMarketsV2.pending, (smartMargin) => {
			smartMargin.queryStatuses.markets = LOADING_STATUS
		})
		builder.addCase(fetchMarketsV2.fulfilled, (smartMargin, { payload }) => {
			smartMargin.queryStatuses.markets = SUCCESS_STATUS
			if (payload) {
				smartMargin.markets[payload.networkId] = payload.markets
			}
		})
		builder.addCase(fetchMarketsV2.rejected, (smartMargin) => {
			smartMargin.queryStatuses.markets = {
				status: FetchStatus.Error,
				error: 'Failed to fetch markets',
			}
		})

		// Smart margin overview
		builder.addCase(fetchSmartMarginBalanceInfo.pending, (smartMargin) => {
			smartMargin.queryStatuses.smartMarginBalanceInfo = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginBalanceInfo.fulfilled, (smartMargin, action) => {
			smartMargin.queryStatuses.smartMarginBalanceInfo = SUCCESS_STATUS
			if (action.payload) {
				const { account, network, balanceInfo } = action.payload
				const wallet = findWalletForAccount(smartMargin, account, network)
				if (wallet) {
					updateSmartMarginAccount(smartMargin, network, wallet, { balanceInfo })
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
		builder.addCase(fetchDailyVolumesV2.pending, (smartMargin) => {
			smartMargin.queryStatuses.dailyVolumes = LOADING_STATUS
		})
		builder.addCase(fetchDailyVolumesV2.fulfilled, (smartMargin, action) => {
			smartMargin.queryStatuses.dailyVolumes = SUCCESS_STATUS
			smartMargin.dailyMarketVolumes = action.payload
		})
		builder.addCase(fetchDailyVolumesV2.rejected, (smartMargin) => {
			smartMargin.queryStatuses.dailyVolumes = {
				status: FetchStatus.Error,
				error: 'Failed to fetch volume data',
			}
		})

		// margin transfers
		builder.addCase(fetchMarginTransfersV2.pending, (smartMargin) => {
			smartMargin.queryStatuses.marginTransfers = LOADING_STATUS
		})
		builder.addCase(fetchMarginTransfersV2.fulfilled, (smartMargin, { payload }) => {
			smartMargin.queryStatuses.marginTransfers = SUCCESS_STATUS
			if (payload) {
				const { context, marginTransfers, idleTransfers } = payload
				const newAccountData = {
					marginTransfers,
					idleTransfers,
				}
				updateSmartMarginAccount(smartMargin, context.network, context.wallet, newAccountData)
			}
		})
		builder.addCase(fetchMarginTransfersV2.rejected, (smartMargin) => {
			smartMargin.queryStatuses.marginTransfers = {
				status: FetchStatus.Error,
				error: 'Failed to fetch margin transfers',
			}
		})

		// Cross margin positions
		builder.addCase(fetchSmartMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.positions = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginPositions.fulfilled, (smartMargin, action) => {
			smartMargin.queryStatuses.positions = SUCCESS_STATUS
			if (!action.payload) return
			const { account, positions, network } = action.payload
			const wallet = findWalletForAccount(smartMargin, account, network)
			if (wallet) {
				updateSmartMarginAccount(smartMargin, network, wallet, { positions })
			}
		})
		builder.addCase(fetchSmartMarginPositions.rejected, (smartMargin) => {
			smartMargin.queryStatuses.positions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			}
		})

		// Refetch selected position
		builder.addCase(refetchSmartMarginPosition.fulfilled, (smartMargin, { payload }) => {
			if (payload) {
				const { position, wallet, networkId } = payload
				const account = smartMargin.accounts[networkId]?.[wallet]

				const existingPositions = account?.positions ?? []
				const index = existingPositions.findIndex((p) => p.marketKey === position.marketKey)
				existingPositions[index] = position
				smartMargin.accounts[networkId][wallet] = {
					...account,
					positions: existingPositions,
				}
			}
		})

		// Fetch Cross Margin Open Orders
		builder.addCase(fetchSmartMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginOpenOrders.fulfilled, (smartMargin, action) => {
			smartMargin.queryStatuses.openOrders = SUCCESS_STATUS
			if (!action.payload) return
			const { network, account, delayedOrders, conditionalOrders } = action.payload
			const wallet = findWalletForAccount(smartMargin, account, network)
			if (wallet) {
				updateSmartMarginAccount(smartMargin, network, wallet, {
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

		// Fetch Smart Margin Trade Preview
		builder.addCase(fetchSmartMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.tradePreview = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginTradePreview.fulfilled, (smartMargin, { payload }) => {
			smartMargin.previews[payload.type] = payload.preview
			smartMargin.queryStatuses.tradePreview = SUCCESS_STATUS
		})

		// Fetch smart margin account
		builder.addCase(fetchSmartMarginAccount.pending, (futuresState) => {
			futuresState.queryStatuses.account = LOADING_STATUS
		})
		builder.addCase(fetchSmartMarginAccount.fulfilled, (smartMargin, action) => {
			if (action.payload) {
				const { network, account, wallet } = action.payload
				smartMargin.accounts[network] = {
					...smartMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_ACCOUNT,
					},
				}
			}
			smartMargin.queryStatuses.account = SUCCESS_STATUS
		})
		builder.addCase(fetchSmartMarginAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.account = {
				status: FetchStatus.Error,
				error: 'Failed to fetch cross margin account',
			}
		})

		// Fetch position history
		builder.addCase(fetchPositionHistoryV2.pending, (futuresState) => {
			futuresState.queryStatuses.positionHistory = LOADING_STATUS
		})
		builder.addCase(fetchPositionHistoryV2.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.positionHistory = SUCCESS_STATUS
			if (payload) {
				const { history: positionHistory, networkId, wallet } = payload
				updateSmartMarginAccount(futuresState, networkId, wallet, {
					positionHistory,
				})
			}
		})
		builder.addCase(fetchPositionHistoryV2.rejected, (futuresState) => {
			futuresState.queryStatuses.positionHistory = {
				error: 'Failed to fetch position history',
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
		builder.addCase(fetchAllV2TradesForAccount.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS
		})
		builder.addCase(fetchAllV2TradesForAccount.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS
			if (payload) {
				const { trades, networkId, wallet } = payload
				mergeTradesForAccount(futuresState, networkId, wallet, trades)
			}
		})
		builder.addCase(fetchAllV2TradesForAccount.rejected, (futuresState) => {
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

export default smartMarginSlice.reducer

export const {
	handlePreviewError,
	setMarketAsset,
	setOrderType,
	setClosePositionOrderType,
	setClosePositionSizeDelta,
	setClosePositionPrice,
	setOrderFeeCap,
	setLeverageSide,
	setSmartMarginTradeInputs,
	setSmartMarginAccount,
	setSmartMarginMarginDelta,
	setSmartMarginTradeStopLoss,
	setSmartMarginTradeTakeProfit,
	setSmartMarginOrderPrice,
	setSmartMarginOrderPriceInvalidLabel,
	setSmartMarginLeverageInput,
	setSmartMarginFees,
	setKeeperDeposit,
	clearSmartMarginTradePreviews,
	setSmartMarginTradePreview,
	setSmartMarginOrderCancelling,
	setSmartMarginEditPositionInputs,
	incrementCrossPreviewCount,
	setSLTPModalStopLoss,
	setSLTPModalTakeProfit,
} = smartMarginSlice.actions

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
	smartMarginState: SmartMarginState,
	network: NetworkId,
	wallet: string,
	trades: FuturesTrade<string>[]
) => {
	const existingTrades = smartMarginState.accounts[network]?.[wallet]?.trades ?? []
	trades.forEach((t) => {
		if (!existingTrades.find((et) => et.txnHash === t.txnHash)) {
			existingTrades.push(t)
		}
	})
	existingTrades.sort((a, b) => b.timestamp - a.timestamp)
	updateSmartMarginAccount(smartMarginState, network, wallet, {
		trades: trades,
	})
}

export const updateSmartMarginAccount = (
	smartMarginState: SmartMarginState,
	network: NetworkId,
	wallet: string,
	newAccountData: Partial<SmartMarginAccountData>
) => {
	const updatedAccount = {
		...ZERO_STATE_ACCOUNT,
		...smartMarginState.accounts[network]?.[wallet],
		...newAccountData,
	}

	smartMarginState.accounts[network] = {
		...smartMarginState.accounts[network],
		[wallet]: updatedAccount,
	}
}
