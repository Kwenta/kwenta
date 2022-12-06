import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
	DEFAULT_FUTURES_MARGIN_TYPE,
	DEFAULT_LEVERAGE,
	DEFAULT_PRICE_IMPACT_DELTA,
} from 'constants/defaults';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesMarket, FuturesMarketKey, FuturesPotentialTradeDetails } from 'sdk/types/futures';
import { PositionSide } from 'sections/futures/types';
import { accountType } from 'state/helpers';
import { FetchStatus } from 'state/types';
import { isUserDeniedError } from 'utils/formatters/error';
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
} from './actions';
import {
	FundingRate,
	FuturesState,
	FuturesTransaction,
	TransactionEstimationPayload,
	TransactionEstimations,
} from './types';

export type CrossMarginTradeInputs = {
	leverage: string;
	nativeSizeDelta: string;
	susdSizeDelta: string;
	orderPrice?: string | undefined;
};

export type IsolatedMarginTradeInputs = {
	nativeSizeDelta: string;
	susdSizeDelta: string;
	priceImpactDelta: string;
	leverage: string;
};

export const ZERO_STATE_TRADE_INPUTS = {
	nativeSizeDelta: '',
	susdSizeDelta: '',
	priceImpactDelta: DEFAULT_PRICE_IMPACT_DELTA,
	leverage: '',
};

const ZERO_STATE_CM_TRADE_INPUTS = {
	...ZERO_STATE_TRADE_INPUTS,
	leverage: '',
};

const initialState: FuturesState = {
	selectedType: DEFAULT_FUTURES_MARGIN_TYPE,
	confirmationModalOpen: false,
	fundingRates: [],
	markets: [],
	dailyMarketVolumes: {},
	queryStatuses: {
		markets: FetchStatus.Idle,
		crossMarginBalanceInfo: FetchStatus.Idle,
		dailyVolumes: FetchStatus.Idle,
		crossMarginPositions: FetchStatus.Idle,
		isolatedPositions: FetchStatus.Idle,
		openOrders: FetchStatus.Idle,
		crossMarginSettings: FetchStatus.Idle,
		isolatedTradePreview: FetchStatus.Idle,
		crossMarginTradePreview: FetchStatus.Idle,
	},
	transaction: undefined,
	transactionEstimations: {} as TransactionEstimations,
	crossMargin: {
		account: undefined,
		selectedMarketAsset: FuturesMarketAsset.sETH,
		selectedMarketKey: FuturesMarketKey.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		selectedLeverage: DEFAULT_LEVERAGE,
		showCrossMarginOnboard: false,
		tradeInputs: ZERO_STATE_CM_TRADE_INPUTS,
		positions: {},
		openOrders: [],
		tradePreview: {
			data: null,
			error: null,
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
		orderType: 'market',
		tradePreview: {
			data: null,
			error: null,
		},
		selectedLeverage: DEFAULT_LEVERAGE,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		positions: {},
		openOrders: [],
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
		setFuturesAccountType: (state, action) => {
			state.selectedType = action.payload;
		},
		setCrossMarginBalanceInfo: (state, action) => {
			state.crossMargin.balanceInfo = action.payload;
		},
		setFuturesMarkets: (state, action: PayloadAction<FuturesMarket<string>[]>) => {
			state.markets = action.payload;
		},
		setFundingRates: (state, action: PayloadAction<FundingRate<string>[]>) => {
			state.fundingRates = action.payload;
		},
		setTransaction: (state, action: PayloadAction<FuturesTransaction | undefined>) => {
			state.transaction = action.payload;
		},
		setIsolatedMarginTradeInputs: (state, action: PayloadAction<IsolatedMarginTradeInputs>) => {
			state.isolatedMargin.tradeInputs = action.payload;
		},
		setCrossMarginTradeInputs: (state, action: PayloadAction<CrossMarginTradeInputs>) => {
			state.crossMargin.tradeInputs = action.payload;
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
				state.transaction.error = action.payload;
			}
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
			action: PayloadAction<{
				data: FuturesPotentialTradeDetails<string> | null;
				error: string | null;
			}>
		) => {
			state.isolatedMargin.tradePreview = action.payload;
		},
		setCrossMarginTradePreview: (
			state,
			action: PayloadAction<{
				data: FuturesPotentialTradeDetails<string> | null;
				error: string | null;
			}>
		) => {
			state.isolatedMargin.tradePreview = action.payload;
		},
	},
	extraReducers: (builder) => {
		// Markets
		builder.addCase(fetchMarkets.pending, (futuresState) => {
			futuresState.queryStatuses.markets = FetchStatus.Loading;
		});
		builder.addCase(fetchMarkets.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.markets = FetchStatus.Success;
			futuresState.markets = action.payload.markets;
			futuresState.fundingRates = action.payload.fundingRates;
		});
		builder.addCase(fetchMarkets.rejected, (futuresState) => {
			futuresState.queryStatuses.markets = FetchStatus.Error;
		});

		// Cross margin overview
		builder.addCase(fetchCrossMarginBalanceInfo.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = FetchStatus.Loading;
		});
		builder.addCase(fetchCrossMarginBalanceInfo.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = FetchStatus.Success;
			futuresState.crossMargin.balanceInfo = action.payload;
		});
		builder.addCase(fetchCrossMarginBalanceInfo.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginBalanceInfo = FetchStatus.Error;
		});

		// Daily volumes
		builder.addCase(fetchDailyVolumes.pending, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = FetchStatus.Loading;
		});
		builder.addCase(fetchDailyVolumes.fulfilled, (futuresState, action) => {
			futuresState.queryStatuses.dailyVolumes = FetchStatus.Success;
			futuresState.dailyMarketVolumes = action.payload;
		});
		builder.addCase(fetchDailyVolumes.rejected, (futuresState) => {
			futuresState.queryStatuses.dailyVolumes = FetchStatus.Error;
		});

		// Cross margin positions
		builder.addCase(fetchCrossMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = FetchStatus.Loading;
		});
		builder.addCase(fetchCrossMarginPositions.fulfilled, (futuresState, action) => {
			if (!futuresState.crossMargin.account) return;
			futuresState.crossMargin.positions[futuresState.crossMargin.account] = action.payload;
			futuresState.queryStatuses.crossMarginPositions = FetchStatus.Success;
		});
		builder.addCase(fetchCrossMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = FetchStatus.Error;
		});

		// Isolated margin positions
		builder.addCase(fetchIsolatedMarginPositions.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = FetchStatus.Loading;
			futuresState.isolatedMargin.tradeInputs = ZERO_STATE_TRADE_INPUTS;
		});
		builder.addCase(fetchIsolatedMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.positions[action.payload.wallet] = action.payload.positions;
			futuresState.queryStatuses.isolatedPositions = FetchStatus.Success;
		});
		builder.addCase(fetchIsolatedMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedPositions = FetchStatus.Error;
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
			futuresState.queryStatuses.openOrders = FetchStatus.Loading;
		});
		builder.addCase(fetchOpenOrders.fulfilled, (futuresState, action) => {
			futuresState[accountType(action.payload.accountType)].openOrders = action.payload.orders;
			futuresState.queryStatuses.openOrders = FetchStatus.Success;
		});
		builder.addCase(fetchOpenOrders.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = FetchStatus.Error;
		});

		// Fetch Cross Margin Settings
		builder.addCase(fetchCrossMarginSettings.pending, (futuresState) => {
			futuresState.queryStatuses.openOrders = FetchStatus.Loading;
		});
		builder.addCase(fetchCrossMarginSettings.fulfilled, (futuresState, action) => {
			futuresState.crossMargin.settings = action.payload;
			futuresState.queryStatuses.crossMarginSettings = FetchStatus.Success;
		});
		builder.addCase(fetchCrossMarginSettings.rejected, (futuresState) => {
			futuresState.queryStatuses.openOrders = FetchStatus.Error;
		});

		// Fetch Isolated Margin Trade Preview
		builder.addCase(fetchIsolatedMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = FetchStatus.Loading;
		});
		builder.addCase(fetchIsolatedMarginTradePreview.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.tradePreview = action.payload;
			futuresState.queryStatuses.isolatedTradePreview = FetchStatus.Success;
		});
		builder.addCase(fetchIsolatedMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.isolatedTradePreview = FetchStatus.Error;
			futuresState.isolatedMargin.tradePreview = { data: null, error: 'Failed to get preview' };
		});

		// Fetch Cross Margin Trade Preview
		builder.addCase(fetchCrossMarginTradePreview.pending, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = FetchStatus.Loading;
		});
		builder.addCase(fetchCrossMarginTradePreview.fulfilled, (futuresState, action) => {
			futuresState.crossMargin.tradePreview = action.payload;
			futuresState.queryStatuses.crossMarginTradePreview = FetchStatus.Success;
		});
		builder.addCase(fetchCrossMarginTradePreview.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginTradePreview = FetchStatus.Error;
			futuresState.crossMargin.tradePreview = { data: null, error: 'Failed to get preview' };
		});
	},
});

export default futuresSlice.reducer;

export const {
	handleTransactionError,
	setMarketAsset,
	setOrderType,
	setLeverageSide,
	setFuturesAccountType,
	setCrossMarginBalanceInfo,
	setFuturesMarkets,
	setTransaction,
	setIsolatedMarginTradeInputs,
	setCrossMarginTradeInputs,
	setCrossMarginAccount,
	updateTransactionStatus,
	updateTransactionHash,
	setTransactionEstimate,
	setIsolatedTradePreview,
	setCrossMarginTradePreview,
} = futuresSlice.actions;
