import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'state/store';

export const fetchSynthBalances = createAsyncThunk<any, void, { state: RootState }>(
	'balances/fetchSynthBalances',
	async (_, { getState }) => {
		const {
			wallet: { walletAddress, networkId },
		} = getState();
	}
);
