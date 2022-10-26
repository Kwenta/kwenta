import { createAsyncThunk } from '@reduxjs/toolkit';
import { NetworkId } from '@synthetixio/contracts-interface';
import { fetchSynthBalances } from 'state/balances/actions';
import { fetchBalances, fetchTokenList } from 'state/exchange/actions';
import type { ThunkConfig } from 'state/types';

export const resetNetwork = createAsyncThunk<any, NetworkId, ThunkConfig>(
	'wallet/resetNetwork',
	async (networkId, { getState, dispatch }) => {
		const {
			wallet: { walletAddress },
		} = getState();

		if (!!walletAddress) {
			await Promise.all([dispatch(fetchSynthBalances()), dispatch(fetchBalances())]);
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

		await dispatch(fetchSynthBalances());

		if (!!networkId) {
			dispatch(fetchBalances());
		}

		return walletAddress;
	}
);
