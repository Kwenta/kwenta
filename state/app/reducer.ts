import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { notifyError } from 'components/ErrorView/ErrorNotifier';
import { TransactionStatus } from 'sdk/types/common';
import { isUserDeniedError } from 'utils/formatters/error';

import { AppState, GasPrice, ModalType, Transaction } from './types';

export const APP_INITIAL_STATE: AppState = {
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
	initialState: APP_INITIAL_STATE,
	reducers: {
		setOpenModal: (state, action: PayloadAction<ModalType>) => {
			state.openModal = action.payload;
		},
		setGasPrice: (state, action: PayloadAction<GasPrice<string>>) => {
			state.gasPrice = action.payload;
		},
		setTransaction: (state, action: PayloadAction<Transaction | undefined>) => {
			state.transaction = action.payload;
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
			} else {
				notifyError(action.payload);
				if (state.transaction) {
					state.transaction.status = TransactionStatus.Failed;
					state.transaction.error = action.payload;
				}
			}
		},
	},
});

export const {
	setOpenModal,
	setGasPrice,
	setTransaction,
	handleTransactionError,
	updateTransactionStatus,
	updateTransactionHash,
} = appSlice.actions;

export default appSlice.reducer;
