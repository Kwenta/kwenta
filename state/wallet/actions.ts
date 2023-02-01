import { createAsyncThunk } from '@reduxjs/toolkit';
import { NetworkId } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { fetchBalances } from 'state/balances/actions';
import type { ThunkConfig } from 'state/types';

import { setWalletAddress } from './reducer';

export const resetNetwork = createAsyncThunk<any, NetworkId, ThunkConfig>(
	'wallet/resetNetwork',
	async (networkId, { getState, dispatch }) => {
		dispatch(fetchBalances());
		return networkId;
	}
);

export const resetWalletAddress = createAsyncThunk<void, string | undefined, ThunkConfig>(
	'wallet/resetWalletAddress',
	async (walletAddress, { dispatch }) => {
		dispatch(setWalletAddress(walletAddress));
		dispatch(fetchBalances());
	}
);

export const setSigner = createAsyncThunk<void, ethers.Signer | null | undefined, ThunkConfig>(
	'wallet/setSigner',
	async (signer, { dispatch, extra: { sdk } }) => {
		if (!!signer) {
			const [address] = await Promise.all([signer?.getAddress(), sdk.setSigner(signer)]);
			dispatch(resetWalletAddress(address));
		} else {
			dispatch(resetWalletAddress(undefined));
			dispatch({ type: 'balances/clearBalances' });
		}
	}
);
