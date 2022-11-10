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
};

const futuresSlice = createSlice({
	name: 'futures',
	initialState,
	reducers: {},
});

export default futuresSlice.reducer;
