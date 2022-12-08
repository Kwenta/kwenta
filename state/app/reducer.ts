import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppState, GasPrice, ModalType } from './types';

const initialState: AppState = {
	openModal: null,
	gasPrice: {
		baseFeePerGas: '0', // Note that this is used for estimating price and should not be included in the transaction
		maxPriorityFeePerGas: '0',
		maxFeePerGas: '0',
		gasPrice: '0',
	},
	gasSpeed: 'fast',
};

const appSlice = createSlice({
	name: 'app',
	initialState,
	reducers: {
		setOpenModal: (state, action: PayloadAction<ModalType>) => {
			state.openModal = action.payload;
		},
		setGasPrice: (state, action: PayloadAction<GasPrice<string>>) => {
			state.gasPrice = action.payload;
		},
	},
});

export const { setOpenModal, setGasPrice } = appSlice.actions;

export default appSlice.reducer;
