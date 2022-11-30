import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_FUTURES_MARGIN_TYPE, DEFAULT_LEVERAGE } from 'constants/defaults';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesMarket } from 'sdk/types/futures';
import { PositionSide } from 'sections/futures/types';
import { accountType } from 'state/helpers';
import { FetchStatus } from 'state/types';
import { isUserDeniedError } from 'utils/formatters/error';
import { FuturesMarketAsset } from 'utils/futures';

import {
	fetchCrossMarginBalanceInfo,
	fetchCrossMarginPositions,
	fetchIsolatedMarginPositions,
	fetchMarkets,
	fetchDailyVolumes,
} from './actions';
import { FundingRate, FuturesState, FuturesTransaction } from './types';

export type CrossMarginTradeInputs = {
	leverage: string;
	nativeSizeDelta: string;
	susdSizeDelta: string;
	orderPrice?: string | undefined;
};

export type IsolatedMarginTradeInputs = {
	nativeSizeDelta: string;
	susdSizeDelta: string;
};

const ZERO_STATE_TRADE_INPUTS = {
	nativeSizeDelta: '',
	susdSizeDelta: '',
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
	},
	transaction: undefined,
	crossMargin: {
		account: undefined,
		marketAsset: FuturesMarketAsset.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		selectedLeverage: DEFAULT_LEVERAGE,
		showCrossMarginOnboard: false,
		tradeInputs: ZERO_STATE_CM_TRADE_INPUTS,
		position: undefined,
		positions: {},
		balanceInfo: {
			freeMargin: '0',
			keeperEthBal: '0',
			allowance: '0',
		},
	},
	isolatedMargin: {
		marketAsset: FuturesMarketAsset.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		selectedLeverage: DEFAULT_LEVERAGE,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		position: undefined,
		positions: {},
	},
};

const futuresSlice = createSlice({
	name: 'futures',
	initialState,
	reducers: {
		setMarketAsset: (state, action) => {
			state[accountType(state.selectedType)].marketAsset = action.payload;
			if (state.selectedType === 'cross_margin') {
				state.crossMargin.marketAsset = action.payload;
				state.crossMargin.tradeInputs = ZERO_STATE_CM_TRADE_INPUTS;
			} else {
				state.isolatedMargin.marketAsset = action.payload;
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
			futuresState.queryStatuses.crossMarginPositions = FetchStatus.Loading;
		});
		builder.addCase(fetchIsolatedMarginPositions.fulfilled, (futuresState, action) => {
			futuresState.isolatedMargin.positions[action.payload.wallet] = action.payload.positions;
			futuresState.queryStatuses.crossMarginPositions = FetchStatus.Success;
		});
		builder.addCase(fetchIsolatedMarginPositions.rejected, (futuresState) => {
			futuresState.queryStatuses.crossMarginPositions = FetchStatus.Error;
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
	setCrossMarginTradeInputs,
	setCrossMarginAccount,
	updateTransactionStatus,
	updateTransactionHash,
} = futuresSlice.actions;
