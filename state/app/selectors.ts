import { RootState } from 'state/store';

import { unserializeGasPrice } from './helpers';

export const selectShowModal = (state: RootState) => state.app.showModal;
export const selectShowPositionModal = (state: RootState) => state.app.showPositionModal;

export const selectGasSpeed = (state: RootState) => state.app.gasSpeed;

export const selectGasPrice = (state: RootState) => unserializeGasPrice(state.app.gasPrice);

export const selectTransaction = (state: RootState) => state.app.transaction;
