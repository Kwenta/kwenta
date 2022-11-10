import { createSlice } from '@reduxjs/toolkit';

import { FuturesState } from './types';

const initialState: FuturesState = {};

const futuresSlice = createSlice({
	name: 'futures',
	initialState,
	reducers: {},
});

export default futuresSlice.reducer;
