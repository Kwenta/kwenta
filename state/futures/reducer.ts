import { createSlice } from '@reduxjs/toolkit';

import { DEFAULT_FUTURES_MARGIN_TYPE, DEFAULT_LEVERAGE } from 'constants/defaults';
import { PositionSide } from 'sections/futures/types';
import { accountType } from 'state/helpers';
import { FetchStatus } from 'state/types';
import { FuturesMarketAsset, FuturesMarketKey, MarketKeyByAsset } from 'utils/futures';

import { fetchMarkets, fetchPosition } from './actions';
import { FuturesState } from './types';

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
	marketsQueryStatus: FetchStatus.Idle,
	crossMargin: {
		marketKey: FuturesMarketKey.pETH,
		marketAsset: FuturesMarketAsset.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		selectedLeverage: DEFAULT_LEVERAGE,
		showCrossMarginOnboard: false,
		tradeInputs: ZERO_STATE_CM_TRADE_INPUTS,
		position: undefined,
		accountOverview: {
			freeMargin: '0',
			keeperEthBal: '0',
			allowance: '0',
		},
	},
	isolatedMargin: {
		transferAmount: '',
		marketKey: FuturesMarketKey.pETH,
		marketAsset: FuturesMarketAsset.sETH,
		leverageSide: PositionSide.LONG,
		orderType: 'market',
		selectedLeverage: DEFAULT_LEVERAGE,
		tradeInputs: ZERO_STATE_TRADE_INPUTS,
		position: undefined,
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
				state.crossMargin.marketKey = MarketKeyByAsset[action.payload as FuturesMarketAsset];
				state.crossMargin.tradeInputs = ZERO_STATE_CM_TRADE_INPUTS;
			} else {
				state.isolatedMargin.marketAsset = action.payload;
				state.isolatedMargin.marketKey = MarketKeyByAsset[action.payload as FuturesMarketAsset];
				state.isolatedMargin.tradeInputs = ZERO_STATE_TRADE_INPUTS;
			}
		},
		setIsolatedTransferAmount: (state, action) => {
			state.isolatedMargin.transferAmount = action.payload;
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
		setCrossMarginAccountOverview: (state, action) => {
			state.crossMargin.accountOverview = action.payload;
		},
		setPosition: (state, action) => {
			state[accountType(state.selectedType)].position = action.payload;
		},
		setFuturesMarkets: (state, action) => {
			state.markets = action.payload;
		},
		setFundingRates: (state, action) => {
			state.fundingRates = action.payload;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchMarkets.pending, (futuresState) => {
			futuresState.marketsQueryStatus = FetchStatus.Loading;
		});
		builder.addCase(fetchMarkets.fulfilled, (futuresState, action) => {
			futuresState.marketsQueryStatus = FetchStatus.Success;
			futuresState.markets = action.payload.markets;
			futuresState.fundingRates = action.payload.fundingRates;
		});
		builder.addCase(fetchMarkets.rejected, (futuresState) => {
			futuresState.marketsQueryStatus = FetchStatus.Error;
		});
		builder.addCase(fetchPosition.pending, (futuresState) => {
			futuresState[accountType(futuresState.selectedType)].position = undefined;
		});
		builder.addCase(fetchPosition.fulfilled, (futuresState, action) => {
			futuresState[accountType(futuresState.selectedType)].position = action.payload;
		});
	},
});

export default futuresSlice.reducer;

export const {
	setMarketAsset,
	setOrderType,
	setLeverageSide,
	setFuturesAccountType,
	setCrossMarginAccountOverview,
	setPosition,
	setFuturesMarkets,
	setIsolatedTransferAmount,
} = futuresSlice.actions;
