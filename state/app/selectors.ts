import { RootState } from 'state/store';

import { unserializeGasPrice } from './helpers';

export const selectOpenModal = (state: RootState) => state.app.openModal;

export const selectGasSpeed = (state: RootState) => state.app.gasSpeed;

export const selectGasPrice = (state: RootState) => unserializeGasPrice(state.app.gasPrice);
