import { createAsyncThunk } from '@reduxjs/toolkit';
import { NetworkId } from '@synthetixio/contracts-interface';
import { fetchSynthBalances } from 'state/balances/actions';
import { fetchBalances, fetchRates, fetchTokenList } from 'state/exchange/actions';
import type { ThunkConfig } from 'state/types';

export const resetNetwork = createAsyncThunk<any, NetworkId, ThunkConfig>(
	'wallet/resetNetwork',
	async (networkId, { dispatch }) => {
		dispatch({ type: 'wallet/setNetwork', payload: { networkId } });
		await Promise.all([
			dispatch(fetchTokenList()),
			dispatch(fetchSynthBalances()),
			dispatch(fetchBalances()),
			dispatch(fetchRates()),
		]);
	}
);

export const resetWalletAddress = createAsyncThunk<any, string, ThunkConfig>(
	'wallet/resetWalletAddress',
	async (walletAddress, { dispatch }) => {
		dispatch({ type: 'wallet/setWalletAddress', payload: { walletAddress } });
		await dispatch(fetchSynthBalances());
		dispatch(fetchBalances());
	}
);
