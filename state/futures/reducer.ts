import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_FUTURES_MARGIN_TYPE, DEFAULT_PRICE_IMPACT_DELTA } from 'constants/defaults';
import { ORDER_PREVIEW_ERRORS } from 'queries/futures/constants';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesMarket, FuturesMarketKey, FuturesPotentialTradeDetails } from 'sdk/types/futures';
import { PositionSide } from 'sections/futures/types';
import { accountType } from 'state/helpers';
import { FetchStatus } from 'state/types';
import { getKnownError, isUserDeniedError } from 'utils/formatters/error';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

import {
	fetchCrossMarginBalanceInfo,
	fetchCrossMarginPositions,
	fetchIsolatedMarginPositions,
	fetchMarkets,
	fetchDailyVolumes,
	refetchPosition,
	fetchOpenOrders,
	fetchCrossMarginSettings,
	fetchIsolatedMarginTradePreview,
	fetchCrossMarginTradePreview,
	fetchKeeperEthBalance,
	fetchIsolatedMarginPositionHistory,
	fetchCrossMarginPositionHistory,
} from './actions';
import {
	CrossMarginTradeFees,
	CrossMarginTradeInputs,
	FuturesState,
	FuturesTransaction,
	IsolatedMarginTradeInputs,
	TransactionEstimationPayload,
	TransactionEstimations,
} from './types';

const ZERO_STATE_TRADE_INPUTS = {
	nativeSize: '',
	susdSize: '',
};

export const ZERO_STATE_CM_TRADE_INPUTS = {
	...ZERO_STATE_TRADE_INPUTS,
	leverage: '1',
};

export const ZERO_CM_FEES = {
	staticFee: '0',
	crossMarginFee: '0',
	limitStopOrderFee: '0',
	keeperEthDeposit: '0',
	total: '0',
};

const DEFAULT_QUERY_STATUS = {
	status: FetchStatus.Idle,
	error: null,
};

const LOADING_STATUS = {
	status: FetchStatus.Loading,
	error: null,
};

const SUCCESS_STATUS = {
	status: FetchStatus.Success,
	error: null,
};

const initialState: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	markets: [],
	dailyMarketVolumes: {},
	errors: {},
	dynamicFeeRate: '0',
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
	},
	transaction: undefined,
	transactionEstimations: {} as TransactionEstimations,
	crossMargin: {
		account: undefined,
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		selectedLeverageByAsset: {},
		showCrossMarginOnboard: false,
		tradeInputs: ZERO_STATE_CM_TRADE_INPUTS,
		fees: ZERO_CM_FEES,
		keeperEthBalance: '0',
		positions: {},
		positionHistory: {},
		openOrders: {},
		tradePreview: null,
		marginDelta: '0',
		orderPrice: {
			price: undefined,
			invalidLabel: undefined,
		},
		balanceInfo: {
			freeMargin: '0',
			keeperEthBal: '0',
			allowance: '0',
		},
		settings: {
			tradeFee: '0',
			limitOrderFee: '0',
			stopOrderFee: '0',
		},
	},
	isolatedMargin: {
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'delayed offchain',
		tradePreview: null,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		priceImpact: DEFAULT_PRICE_IMPACT_DELTA,
		positions: {},
		positionHistory: {},
		openOrders: {},
		tradeFee: '0',
		leverageInput: '0',
	},
};

const futuresSlice = createSlice({
	name: 'futures',
	initialState,
	reducers: {
		setMarketAsset: (state, action) => {
			state[accountType(state.selectedType)].selectedMarketAsset = action.payload;
			state[accountType(state.selectedType)].selectedMarketKey =
				MarketKeyByAsset[action.payload as FuturesMarketAsset];
			if (state.selectedType === 'cross_margin') {
				state.crossMargin.selectedMarketAsset = action.payload;
				state.crossMargin.tradeInputs = ZERO_STATE_CM_TRADE_INPUTS;
			} else {
				state.isolatedMargin.selectedMarketAsset = action.payload;
				state.isolatedMargin.tradeInputs = ZERO_STATE_TRADE_INPUTS;
			}
		},
		setOrderType: (state, action) => {
			state[accountType(state.selectedType)].orderType = action.payload;
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
		setFuturesAccountType: (state, action) => {
			state.selectedType = action.payload;
		},
		setCrossMarginBalanceInfo: (state, action) => {
			state.crossMargin.balanceInfo = action.payload;
		},
		setFuturesMarkets: (state, action: PayloadAction<FuturesMarket<string>[]>) => {
			state.markets = action.payload;
		},
		setDynamicFeeRate: (state, action: PayloadAction<string>) => {
			state.dynamicFeeRate = action.payload;
		},
		setTransaction: (state, action: PayloadAction<FuturesTransaction | undefined>) => {
			state.transaction = action.payload;
		},
		setCrossMarginTradeInputs: (state, action: PayloadAction<CrossMarginTradeInputs<string>>) => {
			state.crossMargin.tradeInputs = action.payload;
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
		setIsolatedMarginTradeInputs: (
			state,
			action: PayloadAction<IsolatedMarginTradeInputs<string>>
		) => {
			state.isolatedMargin.tradeInputs = action.payload;
		},
		setIsolatedMarginFee: (state, action: PayloadAction<string>) => {
			state.isolatedMargin.tradeFee = action.payload;
		},
		setIsolatedMarginLeverageInput: (state, action: PayloadAction<string>) => {
			state.isolatedMargin.leverageInput = action.payload;
		},
		setCrossMarginFees: (state, action: PayloadAction<CrossMarginTradeFees<string>>) => {
			state.crossMargin.fees = action.payload;
		},
		setPreviewError: (state, action: PayloadAction<string | null>) => {
			state.errors.tradePreview = action.payload;
		},
		updateTransactionStatus: (state, action: PayloadAction<TransactionStatus>) => {
			if (state.transaction) {
				state.transaction.status = action.payload;
			}
		},
		updateTransactionHash: (state, action: PayloadAction<string>) => {
			if (state.transaction) {
				state.transaction.hash = action.payload;
			}
		},
		handleTransactionError: (state, action: PayloadAction<string>) => {
			if (isUserDeniedError(action.payload)) {
				state.transaction = undefined;
			} else if (state.transaction) {
				state.transaction.status = TransactionStatus.Failed;
				state.transaction.error = getKnownError(action.payload);
			}
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
		setCrossMarginAccount: (state, action: PayloadAction<string>) => {
			state.crossMargin.account = action.payload;
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
	},
	extraReducers: (builder) => {
		// Markets
		builder.addCase(fetchMarkets.pending, (futuresState) => {
			futuresState.queryStatuses.markets = LOADING_STATUS;
		});
		builder.addCase(fetchMarkets.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.markets = SUCCESS_STATUS;
			futuresState.markets = action.payload.markets;
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
			futuresState.crossMargin.balanceInfo = action.payload;
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

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			if (!futuresState.crossMargin.account) return;
			futuresState.crossMargin.positions[futuresState.crossMargin.account] = action.payload;
			futuresState.queryStatuses.crossMarginPositions = SUCCESS_STATUS;
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
		builder.addCase(fetchIsolatedMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.positions[action.payload.wallet] = action.payload.positions;
			futuresState.queryStatuses.isolatedPositions = SUCCESS_STATUS;
		});
		builder.addCase(fetchIsolatedMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = {
				status: FetchStatus.Error,
				error: 'Failed to fetch positions',
			};
		});

		// Cross margin position history
		builder.addCase(fetchCrossMarginPositionHistory.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositionHistory = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginPositionHistory.fulfilled, (futuresState, action) => {
			if (!futuresState.crossMargin.account) return;
			futuresState.crossMargin.positionHistory[futuresState.crossMargin.account] = action.payload;
			futuresState.queryStatuses.crossMarginPositionHistory = SUCCESS_STATUS;
		});
		builder.addCase(fetchCrossMarginPositionHistory.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositionHistory = {
				status: FetchStatus.Error,
				error: 'Failed to fetch position history',
			};
		});

		// Isolated margin position history
		builder.addCase(fetchIsolatedMarginPositionHistory.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedPositionHistory = LOADING_STATUS;
		});
		builder.addCase(fetchIsolatedMarginPositionHistory.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.positionHistory[action.payload.wallet] =
				action.payload.positionHistory;
			futuresState.queryStatuses.isolatedPositionHistory = SUCCESS_STATUS;
		});
		builder.addCase(fetchIsolatedMarginPositionHistory.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedPositionHistory = {
				status: FetchStatus.Error,
				error: 'Failed to fetch position history',
			};
		});

		// Refetch selected position
		builder.addCase(refetchPosition.fulfilled, (futuresState, action) => {
			const { positions } = futuresState.isolatedMargin;
			if (action.payload && positions[action.payload.wallet]) {
				const existingPositions = [...positions[action.payload.wallet]];
				const index = existingPositions.findIndex(
					(p) => p.marketKey === action.payload!.position.marketKey
				);
				existingPositions[index] = action.payload.position;
				futuresState.isolatedMargin.positions[action.payload.wallet] = existingPositions;
			}
		});

		// Fetch Open Orders
		builder.addCase(fetchOpenOrders.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchOpenOrders.fulfilled, (futuresState, action) => {
			futuresState[accountType(action.payload.accountType)].openOrders[action.payload.account] =
				action.payload.orders;
			futuresState.queryStatuses.openOrders = SUCCESS_STATUS;
		});
		builder.addCase(fetchOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = {
				status: FetchStatus.Error,
				error: 'Failed to fetch open orders',
			};
		});

		// Fetch Cross Margin Settings
		builder.addCase(fetchCrossMarginSettings.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = LOADING_STATUS;
		});
		builder.addCase(fetchCrossMarginSettings.fulfilled, (futuresState, action) => {
			futuresState.crossMargin.settings = action.payload;
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
			futuresState.crossMargin.keeperEthBalance = action.payload;
		});
	},
});

export default futuresSlice.reducer;

export const {
	handleCrossMarginPreviewError,
	handleIsolatedMarginPreviewError,
	handleTransactionError,
	setMarketAsset,
	setOrderType,
	setLeverageSide,
	setFuturesAccountType,
	setCrossMarginBalanceInfo,
	setFuturesMarkets,
	setTransaction,
	setCrossMarginTradeInputs,
	setCrossMarginAccount,
	setCrossMarginMarginDelta,
	setCrossMarginFees,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setDynamicFeeRate,
	updateTransactionStatus,
	updateTransactionHash,
	setTransactionEstimate,
	setIsolatedMarginLeverageInput,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	setIsolatedMarginFee,
	setCrossMarginTradePreview,
	setCrossMarginLeverageForAsset,
	setPreviewError,
} = futuresSlice.actions;
