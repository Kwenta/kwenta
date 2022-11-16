import { createSlice } from '@reduxjs/toolkit';

import { PositionSide } from 'sections/futures/types';
import { FuturesMarketAsset } from 'utils/futures';

import { FuturesState } from './types';

const initialState: FuturesState = {
	marketAsset: FuturesMarketAsset.sETH,
	leverageSide: PositionSide.LONG,
	orderType: 'market',
	futuresAccountType: 'isolated_margin',
	showCrossMarginOnboard: false,
	confirmationModalOpen: false,
	position: undefined,
	crossMarginAccountOverview: {
		freeMargin: '0',
		keeperEthBal: '0',
		allowance: '0',
	},
	futuresMarkets: [],
};

const futuresSlice = createSlice({
	name: 'futures',
	initialState,
	reducers: {
		setMarketAsset: (state, action) => {
			state.marketAsset = action.payload;
		},
		setOrderType: (state, action) => {
			state.orderType = action.payload;
		},
		setLeverageSide: (state, action) => {
			state.leverageSide = action.payload;
		},
		setFuturesAccountType: (state, action) => {
			state.futuresAccountType = action.payload;
		},
		setCrossMarginAccountOverview: (state, action) => {
			state.crossMarginAccountOverview = action.payload;
		},
		setPosition: (state, action) => {
			state.position = action.payload;
		},
		setFuturesMarkets: (state, action) => {
			state.futuresMarkets = action.payload;
		},
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
} = futuresSlice.actions;
