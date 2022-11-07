import { createAsyncThunk } from '@reduxjs/toolkit';
import { NetworkId } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';
import { fetchSynthBalances } from 'state/balances/actions';
import { fetchRedeemableBalances, fetchTokenList } from 'state/exchange/actions';
import type { ThunkConfig } from 'state/types';

export const resetNetwork = createAsyncThunk<any, NetworkId, ThunkConfig>(
	'wallet/resetNetwork',
	async (networkId, { getState, dispatch }) => {
		const {
			wallet: { walletAddress },
		} = getState();

		if (!!walletAddress) {
			await Promise.all([
				dispatch(fetchSynthBalances(walletAddress)),
				dispatch(fetchRedeemableBalances()),
			]);
		}

		await dispatch(fetchTokenList());

		return networkId;
	}
);

export const resetWalletAddress = createAsyncThunk<any, string, ThunkConfig>(
	'wallet/resetWalletAddress',
	async (walletAddress, { dispatch, getState }) => {
		const {
			wallet: { networkId },
		} = getState();

		await dispatch(fetchSynthBalances(walletAddress));

		if (!!networkId) {
			dispatch(fetchRedeemableBalances());
		}

		return walletAddress;
	}
);

export const setSigner = createAsyncThunk<void, ethers.Signer | null | undefined, ThunkConfig>(
	'wallet/setSigner',
	async (signer, { dispatch, extra: { sdk } }) => {
		if (!!signer) {
			const [address] = await Promise.all([signer?.getAddress(), sdk.setSigner(signer)]);
			dispatch(resetWalletAddress(address));
		} else {
			dispatch({ type: 'balances/clearBalances' });
		}
	}
);
