import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { notifyError } from 'components/ErrorView/ErrorNotifier';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesMarketKey } from 'sdk/types/futures';
import { OperationalStatus } from 'sdk/types/system';
import { isUserDeniedError } from 'utils/formatters/error';

import { checkSynthetixStatus, fetchKwentaStatus } from './actions';
import { AppState, FuturesPositionModalType, GasPrice, ModalType, Transaction } from './types';

export const APP_INITIAL_STATE: AppState = {
	showModal: undefined,
	gasPrice: {
		baseFeePerGas: '0', // Note that this is used for estimating price and should not be included in the transaction
		maxPriorityFeePerGas: '0',
		maxFeePerGas: '0',
		gasPrice: '0',
	},
	gasSpeed: 'fast',
	synthetixOnMaintenance: false,
	kwentaStatus: {
		status: OperationalStatus.FullyOperational,
		message: '',
		lastUpdatedAt: undefined,
	},
};

const appSlice = createSlice({
	name: 'app',
	initialState: APP_INITIAL_STATE,
	reducers: {
		setOpenModal: (state, action: PayloadAction<ModalType>) => {
			if (action.payload) {
				state.showPositionModal = null;
			}
			state.showModal = action.payload;
		},
		setShowPositionModal: (
			state,
			action: PayloadAction<{ type: FuturesPositionModalType; marketKey: FuturesMarketKey } | null>
		) => {
			if (action.payload) {
				state.showModal = null;
			}
			state.showPositionModal = action.payload;
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
				notifyError('Transaction failed', new Error(action.payload));
				if (state.transaction) {
					state.transaction.status = TransactionStatus.Failed;
					state.transaction.error = action.payload;
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(checkSynthetixStatus.fulfilled, (state, action) => {
			state.synthetixOnMaintenance = action.payload;
		});
		builder.addCase(fetchKwentaStatus.fulfilled, (state, action) => {
			state.kwentaStatus = action.payload;
		});
	},
});

export const {
	setOpenModal,
	setShowPositionModal,
	setGasPrice,
	setTransaction,
	handleTransactionError,
	updateTransactionStatus,
	updateTransactionHash,
} = appSlice.actions;

export default appSlice.reducer;
