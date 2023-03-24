import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_FUTURES_MARGIN_TYPE, DEFAULT_PRICE_IMPACT_DELTA } from 'constants/defaults';
import { ORDER_PREVIEW_ERRORS } from 'queries/futures/constants';
import { NetworkId } from 'sdk/types/common';
import {
	FuturesMarket,
	FuturesMarketAsset,
	FuturesMarketKey,
	FuturesPotentialTradeDetails,
	PositionSide,
} from 'sdk/types/futures';
import {
	DEFAULT_MAP_BY_NETWORK,
	DEFAULT_QUERY_STATUS,
	LOADING_STATUS,
	SUCCESS_STATUS,
	ZERO_CM_FEES,
	ZERO_STATE_ACCOUNT,
	ZERO_STATE_TRADE_INPUTS,
} from 'state/constants';
import { accountType } from 'state/helpers';
import { FetchStatus } from 'state/types';
import { MarketKeyByAsset } from 'utils/futures';

import {
	fetchCrossMarginBalanceInfo,
	fetchCrossMarginPositions,
	fetchIsolatedMarginPositions,
	fetchMarkets,
	fetchDailyVolumes,
	refetchPosition,
	fetchCrossMarginOpenOrders,
	fetchCrossMarginSettings,
	fetchIsolatedMarginTradePreview,
	fetchCrossMarginTradePreview,
	fetchKeeperEthBalance,
	fetchCrossMarginAccount,
	fetchFuturesPositionHistory,
	fetchPositionHistoryForTrader,
	fetchTradesForSelectedMarket,
	fetchAllTradesForAccount,
	fetchIsolatedOpenOrders,
	fetchMarginTransfers,
	getClosePositionOrderFee,
} from './actions';
import {
	AccountContext,
	CrossMarginAccountData,
	CrossMarginState,
	CrossMarginTradeFees,
	EditPositionInputs,
	FuturesState,
	InputCurrencyDenomination,
	IsolatedAccountData,
	TradeSizeInputs,
	TransactionEstimationPayload,
	TransactionEstimations,
} from './types';

export const FUTURES_INITIAL_STATE: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	markets: [],
	dailyMarketVolumes: {},
	errors: {},
	fundingRates: [],
	selectedInputDenomination: 'usd',
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
		crossMarginSettings: DEFAULT_QUERY_STATUS,
		isolatedTradePreview: DEFAULT_QUERY_STATUS,
		crossMarginTradePreview: DEFAULT_QUERY_STATUS,
		crossMarginAccount: DEFAULT_QUERY_STATUS,
		positionHistory: DEFAULT_QUERY_STATUS,
		selectedTraderPositionHistory: DEFAULT_QUERY_STATUS,
		trades: DEFAULT_QUERY_STATUS,
		marginTransfers: DEFAULT_QUERY_STATUS,
		closePositionOrderFee: DEFAULT_QUERY_STATUS,
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
		editPositionInputs: {
			nativeSizeDelta: '',
			marginDelta: '',
		},
		fees: ZERO_CM_FEES,
		tradePreview: null,
		marginDelta: '0',
		cancellingOrder: undefined,
		depositApproved: false,
		showOnboard: false,
		orderPrice: {
			price: undefined,
			invalidLabel: undefined,
		},
		settings: {
			fees: {
				base: '0',
				limit: '0',
				stop: '0',
			},
		},
	},
	isolatedMargin: {
		accounts: DEFAULT_MAP_BY_NETWORK,
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETHPERP,
		leverageSide: PositionSide.LONG,
		orderType: 'delayed_offchain',
		tradePreview: null,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		editPositionInputs: {
			nativeSizeDelta: '',
			marginDelta: '',
		},
		priceImpact: DEFAULT_PRICE_IMPACT_DELTA,
		tradeFee: '0',
		leverageInput: '0',
	},
	closePositionOrderFee: '0',
};

const futuresSlice = createSlice({
	name: 'futures',
	initialState: FUTURES_INITIAL_STATE,
	reducers: {
		setMarketAsset: (state, action) => {
			state[accountType(state.selectedType)].selectedMarketAsset = action.payload;
			state[accountType(state.selectedType)].selectedMarketKey =
				MarketKeyByAsset[action.payload as FuturesMarketAsset];
			state[accountType(state.selectedType)].tradeInputs = ZERO_STATE_TRADE_INPUTS;
			state[accountType(state.selectedType)].selectedMarketAsset = action.payload;
		},
		setOrderType: (state, action) => {
			state[accountType(state.selectedType)].orderType = action.payload;
		},
		setOrderFeeCap: (state, action) => {
			state.crossMargin.orderFeeCap = action.payload;
		},
		setLeverageSide: (state, action) => {
			state[accountType(state.selectedType)].leverageSide = action.payload;
		},
		setCrossMarginLeverageForAsset: (
			state,
			action: PayloadAction<{ marketKey: FuturesMarketKey; leverage: string }>
		) => {
			state.crossMargin.selectedLeverageByAsset[action.payload.marketKey] = action.payload.leverage;
		},
		setCrossMarginMarginDelta: (state, action: PayloadAction<string>) => {
			state.crossMargin.marginDelta = action.payload;
		},
		setCrossMarginTradeStopLoss: (state, action: PayloadAction<string>) => {
			state.crossMargin.tradeInputs.stopLossPrice = action.payload;
		},
		setCrossMarginTradeTakeProfit: (state, action: PayloadAction<string>) => {
			state.crossMargin.tradeInputs.takeProfitPrice = action.payload;
		},
		setFuturesAccountType: (state, action) => {
			state.selectedType = action.payload;
		},
		setFuturesMarkets: (state, action: PayloadAction<FuturesMarket<string>[]>) => {
			state.markets = action.payload;
		},
		setCrossMarginTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
			state.crossMargin.tradeInputs = action.payload;
		},
		setCrossMarginEditPositionInputs: (
			state,
			action: PayloadAction<EditPositionInputs<string>>
		) => {
			state.crossMargin.editPositionInputs = action.payload;
		},
		setCrossMarginOrderPrice: (state, action: PayloadAction<string>) => {
			state.crossMargin.orderPrice.price = action.payload;
		},
		setCrossMarginOrderPriceInvalidLabel: (
			state,
			action: PayloadAction<string | null | undefined>
		) => {
			state.crossMargin.orderPrice.invalidLabel = action.payload;
		},
		setIsolatedMarginTradeInputs: (state, action: PayloadAction<TradeSizeInputs<string>>) => {
			state.isolatedMargin.tradeInputs = action.payload;
		},
		setIsolatedMarginEditPositionInputs: (
			state,
			action: PayloadAction<EditPositionInputs<string>>
		) => {
			state.isolatedMargin.editPositionInputs = action.payload;
		},
		setSelectedInputDenomination: (state, action: PayloadAction<InputCurrencyDenomination>) => {
			state.selectedInputDenomination = action.payload;
		},
		setIsolatedMarginFee: (state, action: PayloadAction<string>) => {
			state.isolatedMargin.tradeFee = action.payload;
		},
		setLeverageInput: (state, action: PayloadAction<string>) => {
			state[accountType(state.selectedType)].leverageInput = action.payload;
		},
		setCrossMarginFees: (state, action: PayloadAction<CrossMarginTradeFees<string>>) => {
			state.crossMargin.fees = action.payload;
		},
		setPreviewError: (state, action: PayloadAction<string | null>) => {
			state.errors.tradePreview = action.payload;
		},
		setShowCrossMarginOnboard: (state, action: PayloadAction<boolean>) => {
			state.crossMargin.showOnboard = action.payload;
		},
		handleCrossMarginPreviewError: (futuresState, action: PayloadAction<string>) => {
			const message = Object.values(ORDER_PREVIEW_ERRORS).includes(action.payload)
				? action.payload
				: 'Failed to get trade preview';
			futuresState.queryStatuses.crossMarginTradePreview = {
				status: FetchStatus.Error,
				error: message,
			};
			futuresState.crossMargin.tradePreview = null;
		},
		handleIsolatedMarginPreviewError: (futuresState, action: PayloadAction<string>) => {
			const message = Object.values(ORDER_PREVIEW_ERRORS).includes(action.payload)
				? action.payload
				: 'Failed to get trade preview';
			futuresState.queryStatuses.isolatedTradePreview = {
				status: FetchStatus.Error,
				error: message,
			};
			futuresState.isolatedMargin.tradePreview = null;
		},
		setCrossMarginAccount: (
			state,
			action: PayloadAction<{ wallet: string; account: string; network: NetworkId }>
		) => {
			const { account, wallet, network } = action.payload;
			if (!state.crossMargin.accounts[network]?.[wallet]?.account) {
				state.crossMargin.accounts[network] = {
					...state.crossMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_ACCOUNT,
					},
				};
			}
		},
		setTransactionEstimate: (state, action: PayloadAction<TransactionEstimationPayload>) => {
			state.transactionEstimations[action.payload.type] = {
				limit: action.payload.limit,
				cost: action.payload.cost,
				error: action.payload.error,
			};
		},
		setIsolatedTradePreview: (
			state,
			action: PayloadAction<FuturesPotentialTradeDetails<string> | null>
		) => {
			state.isolatedMargin.tradePreview = action.payload;
		},
		setCrossMarginTradePreview: (
			state,
			action: PayloadAction<FuturesPotentialTradeDetails<string> | null>
		) => {
			state.crossMargin.tradePreview = action.payload;
		},
		setCrossMarginOrderCancelling: (state, { payload }: PayloadAction<number | undefined>) => {
			state.crossMargin.cancellingOrder = payload;
		},
		setSelectedTrader: (state, action: PayloadAction<string | undefined>) => {
			state.leaderboard.selectedTrader = action.payload;
		},
	},
	extraReducers: (builder) => {
		// TODO: Separate markets by network
		// Markets
		builder.addCase(fetchMarkets.pending, (futuresState) => {
			futuresState.queryStatuses.markets = LOADING_STATUS;
		});
		builder.addCase(fetchMarkets.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.markets = SUCCESS_STATUS;
			if (action.payload?.markets) {
				futuresState.markets = action.payload.markets;
			}
		});
		builder.addCase(fetchMarkets.rejected, (futuresState) => {
			futuresState.queryStatuses.markets = {
				status: FetchStatus.Error,
				error: 'Failed to fetch markets',
			};
		});

		// Cross margin overview
		builder.addCase(fetchCrossMarginBalanceInfo.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginBalanceInfo.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = SUCCESS_STATUS;
			if (action.payload) {
				const { account, network, balanceInfo } = action.payload;
				const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
				if (wallet) {
					futuresState.crossMargin.accounts[network][wallet].balanceInfo = balanceInfo;
				}
			}
		});
		builder.addCase(fetchCrossMarginBalanceInfo.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = {
				status: FetchStatus.Error,
				error: 'Failed to fetch balance info',
			};
		});

		// Daily volumes
		builder.addCase(fetchDailyVolumes.pending, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = LOADING_STATUS;
		});
		builder.addCase(fetchDailyVolumes.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.dailyVolumes = SUCCESS_STATUS;
			futuresState.dailyMarketVolumes = action.payload;
		});
		builder.addCase(fetchDailyVolumes.rejected, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = {
				status: FetchStatus.Error,
				error: 'Failed to fetch volume data',
			};
		});

		// margin transfers
		builder.addCase(fetchMarginTransfers.pending, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = LOADING_STATUS;
		});
		builder.addCase(fetchMarginTransfers.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.marginTransfers = SUCCESS_STATUS;
			if (payload) {
				const { context, marginTransfers } = payload;
				const account = getOrCreateAccount(futuresState, context);
				account.marginTransfers = marginTransfers;
			}
		});
		builder.addCase(fetchMarginTransfers.rejected, (futuresState) => {
			futuresState.queryStatuses.marginTransfers = {
				status: FetchStatus.Error,
				error: 'Failed to fetch margin transfers',
			};
		});

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginPositions = SUCCESS_STATUS;
			if (!action.payload) return;
			const { account, positions, network } = action.payload;
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
			if (wallet) {
				futuresState.crossMargin.accounts[network][wallet].positions = positions;
			}
		});
		builder.addCase(fetchCrossMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			};
		});

		// Isolated margin positions
		builder.addCase(fetchIsolatedMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = LOADING_STATUS;
		});
		builder.addCase(fetchIsolatedMarginPositions.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.isolatedPositions = SUCCESS_STATUS;
			if (payload && futuresState.isolatedMargin.accounts[payload.network]) {
				futuresState.isolatedMargin.accounts[payload.network][payload.wallet] = {
					...futuresState.isolatedMargin.accounts[payload.network][payload.wallet],
					positions: payload.positions,
				};
			}
		});
		builder.addCase(fetchIsolatedMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			};
		});

		// Refetch selected position
		builder.addCase(refetchPosition.fulfilled, (futuresState, { payload }) => {
			if (payload && futuresState.isolatedMargin.accounts[payload.networkId]) {
				const existingPositions =
					futuresState.isolatedMargin.accounts[payload.networkId][payload.wallet]?.positions || [];
				const index = existingPositions.findIndex(
					(p) => p.marketKey === payload!.position.marketKey
				);
				existingPositions[index] = payload.position;
				futuresState.isolatedMargin.accounts[payload.networkId][payload.wallet] = {
					...futuresState.isolatedMargin.accounts[payload.networkId][payload.wallet],
					positions: existingPositions,
				};
			}
		});

		// Fetch Cross Margin Open Orders
		builder.addCase(fetchCrossMarginOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginOpenOrders.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS;
			if (!action.payload) return;
			const { network, account, delayedOrders, conditionalOrders } = action.payload;
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
			if (wallet) {
				futuresState.crossMargin.accounts[network][wallet].conditionalOrders = conditionalOrders;
				futuresState.crossMargin.accounts[network][wallet].delayedOrders = delayedOrders;
			}
		});
		builder.addCase(fetchCrossMarginOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for cross margin account',
			};
		});

		// Fetch Isolated Open Orders
		builder.addCase(fetchIsolatedOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchIsolatedOpenOrders.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS;
			if (!payload) return;
			const { wallet, orders } = payload;
			if (wallet) {
				if (futuresState.isolatedMargin.accounts[payload.networkId]) {
					futuresState.isolatedMargin.accounts[payload.networkId][wallet] = {
						...futuresState.isolatedMargin.accounts[payload.networkId][wallet],
						delayedOrders: orders,
					};
				}
			}
		});
		builder.addCase(fetchIsolatedOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders for isolated margin',
			};
		});

		// Fetch Cross Margin Settings
		builder.addCase(fetchCrossMarginSettings.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginSettings.fulfilled, (futuresState, action) => {
			if (action.payload) {
				futuresState.crossMargin.settings = action.payload;
			}
			futuresState.queryStatuses.crossMarginSettings = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginSettings.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginSettings = {
				status: FetchStatus.Error,
				error: 'Failed to fetch cross margin settings',
			};
		});

		// Fetch Isolated Margin Trade Preview
		builder.addCase(fetchIsolatedMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = LOADING_STATUS;
		});
		builder.addCase(fetchIsolatedMarginTradePreview.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.tradePreview = action.payload;
			futuresState.queryStatuses.isolatedTradePreview = SUCCESS_STATUS;
		});
		builder.addCase(fetchIsolatedMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = {
				status: FetchStatus.Error,
				error: 'Failed to fetch trade preview',
			};
			futuresState.isolatedMargin.tradePreview = null;
		});

		// Fetch Cross Margin Trade Preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, action) => {
			futuresState.crossMargin.tradePreview = action.payload;
			futuresState.queryStatuses.crossMarginTradePreview = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = {
				error: 'Failed to get preview',
				status: FetchStatus.Error,
			};
			futuresState.crossMargin.tradePreview = null;
		});

		// Fetch keeper balance
		builder.addCase(fetchKeeperEthBalance.fulfilled, (futuresState, action) => {
			if (!action.payload) return;
			const { account, network, balance } = action.payload;
			const wallet = findWalletForAccount(futuresState.crossMargin, account, network);
			if (wallet) {
				futuresState.crossMargin.accounts[network][wallet].balanceInfo.keeperEthBal = balance;
			}
		});

		// Fetch cross margin account
		builder.addCase(fetchCrossMarginAccount.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginAccount = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginAccount.fulfilled, (futuresState, action) => {
			if (action.payload) {
				const { network, account, wallet } = action.payload;
				futuresState.crossMargin.accounts[network] = {
					...futuresState.crossMargin.accounts[network],
					[wallet]: {
						account: account,
						...ZERO_STATE_ACCOUNT,
					},
				};
			}
			futuresState.queryStatuses.crossMarginAccount = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginAccount = {
				status: FetchStatus.Error,
				error: 'Failed to fetch cross margin account',
			};
		});

		// Fetch position history
		builder.addCase(fetchFuturesPositionHistory.pending, (futuresState) => {
			futuresState.queryStatuses.positionHistory = LOADING_STATUS;
		});
		builder.addCase(fetchFuturesPositionHistory.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.positionHistory = SUCCESS_STATUS;
			if (!payload) return;
			if (payload.accountType === 'isolated_margin') {
				if (futuresState.isolatedMargin.accounts[payload.networkId]) {
					futuresState.isolatedMargin.accounts[payload.networkId][payload.account] = {
						...futuresState.isolatedMargin.accounts[payload.networkId][payload.account],
						positionHistory: payload.history,
					};
				}
			} else {
				const wallet = findWalletForAccount(
					futuresState.crossMargin,
					payload.account,
					payload.networkId
				);
				if (wallet) {
					futuresState.crossMargin.accounts[payload.networkId][
						wallet
					].positionHistory = payload.history.filter((p) => p.accountType === 'cross_margin');
				}
			}
		});
		builder.addCase(fetchFuturesPositionHistory.rejected, (futuresState) => {
			futuresState.queryStatuses.positionHistory = {
				error: 'Failed to fetch position history',
				status: FetchStatus.Error,
			};
		});

		// Fetch position history for trader
		builder.addCase(fetchPositionHistoryForTrader.pending, (futuresState) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = LOADING_STATUS;
		});
		builder.addCase(fetchPositionHistoryForTrader.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = SUCCESS_STATUS;
			if (!payload) return;
			futuresState.leaderboard.selectedTraderPositionHistory[payload.networkId] = {
				...futuresState.leaderboard.selectedTraderPositionHistory[payload.networkId],
				[payload.address]: payload.history,
			};
		});
		builder.addCase(fetchPositionHistoryForTrader.rejected, (futuresState) => {
			futuresState.queryStatuses.selectedTraderPositionHistory = {
				error: 'Failed to fetch traders position history',
				status: FetchStatus.Error,
			};
		});

		// Fetch trades for market
		builder.addCase(fetchTradesForSelectedMarket.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS;
		});
		builder.addCase(fetchTradesForSelectedMarket.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS;
			if (!payload) return;
			if (payload.accountType === 'isolated_margin') {
				if (futuresState.isolatedMargin.accounts[payload.networkId]) {
					futuresState.isolatedMargin.accounts[payload.networkId][payload.account] = {
						...futuresState.isolatedMargin.accounts[payload.networkId][payload.account],
						trades: payload.trades,
					};
				}
			} else {
				futuresState.crossMargin.accounts[payload.networkId][payload.wallet].trades =
					payload.trades;
			}
		});
		builder.addCase(fetchTradesForSelectedMarket.rejected, (futuresState) => {
			futuresState.queryStatuses.trades = {
				error: 'Failed to fetch trades',
				status: FetchStatus.Error,
			};
		});

		// TODO: Combine all with market trades rather than overwrite as the filter is done on selector

		// Fetch all trades for account
		builder.addCase(fetchAllTradesForAccount.pending, (futuresState) => {
			futuresState.queryStatuses.trades = LOADING_STATUS;
		});
		builder.addCase(fetchAllTradesForAccount.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.trades = SUCCESS_STATUS;
			if (!payload) return;
			if (payload.accountType === 'isolated_margin') {
				if (futuresState.isolatedMargin.accounts[payload.networkId]) {
					futuresState.isolatedMargin.accounts[payload.networkId][payload.account] = {
						...futuresState.isolatedMargin.accounts[payload.networkId][payload.account],
						trades: payload.trades,
					};
				}
			} else {
				futuresState.crossMargin.accounts[payload.networkId][payload.wallet].trades =
					payload.trades;
			}
		});
		builder.addCase(fetchAllTradesForAccount.rejected, (futuresState) => {
			futuresState.queryStatuses.trades = {
				error: 'Failed to fetch trades',
				status: FetchStatus.Error,
			};
		});
		builder.addCase(getClosePositionOrderFee.fulfilled, (futuresState, { payload }) => {
			futuresState.queryStatuses.closePositionOrderFee = SUCCESS_STATUS;
			futuresState.closePositionOrderFee = payload.toString();
		});
		builder.addCase(getClosePositionOrderFee.rejected, (futuresState, { error }) => {
			futuresState.queryStatuses.closePositionOrderFee = {
				error: error.message,
				status: FetchStatus.Error,
			};
			futuresState.closePositionOrderFee = '0';
		});
	},
});

export default futuresSlice.reducer;

export const {
	handleCrossMarginPreviewError,
	handleIsolatedMarginPreviewError,
	setMarketAsset,
	setOrderType,
	setOrderFeeCap,
	setLeverageSide,
	setFuturesAccountType,
	setFuturesMarkets,
	setCrossMarginTradeInputs,
	setCrossMarginAccount,
	setCrossMarginMarginDelta,
	setCrossMarginTradeStopLoss,
	setCrossMarginTradeTakeProfit,
	setCrossMarginFees,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setTransactionEstimate,
	setLeverageInput,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	setIsolatedMarginFee,
	setCrossMarginTradePreview,
	setCrossMarginLeverageForAsset,
	setPreviewError,
	setCrossMarginOrderCancelling,
	setShowCrossMarginOnboard,
	setSelectedTrader,
	setSelectedInputDenomination,
	setCrossMarginEditPositionInputs,
	setIsolatedMarginEditPositionInputs,
} = futuresSlice.actions;

const findWalletForAccount = (
	crossMarginState: CrossMarginState,
	account: string,
	network: NetworkId
) => {
	const entry = Object.entries(crossMarginState.accounts[network]).find(([_, value]) => {
		return value.account === account;
	});
	return entry ? entry[0] : undefined;
};

// TODO: Use this pattern throughout
const getOrCreateAccount = (
	futuresState: FuturesState,
	context: AccountContext
): IsolatedAccountData | CrossMarginAccountData => {
	if (context.cmAccount && context.type === 'cross_margin') {
		if (futuresState.crossMargin.accounts[context.network]?.[context.wallet]) {
			return futuresState.crossMargin.accounts[context.network][context.wallet];
		} else {
			const account = {
				account: context.cmAccount,
				...ZERO_STATE_ACCOUNT,
			};
			futuresState.crossMargin.accounts[context.network] = {
				...futuresState.crossMargin.accounts[context.network],
				[context.wallet]: account,
			};
			return futuresState.crossMargin.accounts[context.network][context.wallet];
		}
	} else {
		if (futuresState.isolatedMargin.accounts[context.network]?.[context.wallet]) {
			return futuresState.isolatedMargin.accounts[context.network][context.wallet];
		} else {
			futuresState.isolatedMargin.accounts[context.network] = {
				...futuresState.isolatedMargin.accounts[context.network],
				[context.wallet]: { ...ZERO_STATE_ACCOUNT },
			};
			return futuresState.isolatedMargin.accounts[context.network][context.wallet];
		}
	}
};
