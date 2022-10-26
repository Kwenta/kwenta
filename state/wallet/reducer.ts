import { createSlice } from '@reduxjs/toolkit';

import { resetNetwork, resetWalletAddress } from './actions';
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
			state.walletAddress = action.payload;
		},
		setNetwork: (state, action) => {
			state.networkId = action.payload;
		},
		disconnect: (state) => {
			state.walletAddress = undefined;
			state.networkId = undefined;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(resetNetwork.fulfilled, (state, action) => {
			state.networkId = action.payload;
		});
		builder.addCase(resetWalletAddress.fulfilled, (state, action) => {
			state.walletAddress = action.payload;
		});
	},
});

export const { setWalletAddress, setNetwork } = walletSlice.actions;

export default walletSlice.reducer;
