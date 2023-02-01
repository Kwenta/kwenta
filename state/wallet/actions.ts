import { createAsyncThunk } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/browser';
import { NetworkId } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';

import { fetchBalances } from 'state/balances/actions';
import { fetchRedeemableBalances, fetchTokenList } from 'state/exchange/actions';
import type { ThunkConfig } from 'state/types';

import { setWalletAddress } from './reducer';

export const resetNetwork = createAsyncThunk<any, NetworkId, ThunkConfig>(
	'wallet/resetNetwork',
	async (networkId, { getState, dispatch }) => {
		const {
			wallet: { walletAddress },
		} = getState();

		if (!!walletAddress) {
			await Promise.all([dispatch(fetchBalances()), dispatch(fetchRedeemableBalances())]);
		}

		await dispatch(fetchTokenList());

		return networkId;
	}
);

export const resetWalletAddress = createAsyncThunk<void, string | undefined, ThunkConfig>(
	'wallet/resetWalletAddress',
	async (walletAddress, { dispatch, getState }) => {
		const {
			wallet: { networkId },
		} = getState();
		dispatch(setWalletAddress(walletAddress));
		await dispatch(fetchBalances());

		if (!!networkId) {
			dispatch(fetchRedeemableBalances());
		}
	}
);

export const setSigner = createAsyncThunk<void, ethers.Signer | null | undefined, ThunkConfig>(
	'wallet/setSigner',
	async (signer, { dispatch, extra: { sdk } }) => {
		if (!!signer) {
			const [address] = await Promise.all([signer?.getAddress(), sdk.setSigner(signer)]);
			Sentry.setUser({ id: address });
			dispatch(resetWalletAddress(address));
		} else {
			dispatch(resetWalletAddress(undefined));
			dispatch({ type: 'balances/clearBalances' });
		}
	}
);
