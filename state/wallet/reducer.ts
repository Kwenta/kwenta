import { createSlice } from '@reduxjs/toolkit';

import { WalletState } from './types';

const initialState: WalletState = {
	walletAddress: undefined,
	networkId: undefined,
};

const walletSlice = createSlice({
	name: 'wallet',
	initialState,
	reducers: {
		setWalletAddress: (state, action) => {
			state.walletAddress = action.payload.walletAddress;
		},
		setNetwork: (state, action) => {
			state.networkId = action.payload.networkId;
		},
		disconnect: (state) => {
			state.walletAddress = undefined;
			state.networkId = undefined;
		},
	},
});

export const { setWalletAddress, setNetwork } = walletSlice.actions;

export default walletSlice.reducer;
