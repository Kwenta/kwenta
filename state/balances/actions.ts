import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'state/store';

export const fetchSynthBalances = createAsyncThunk<any, void, ThunkConfig>(
	'balances/fetchSynthBalances',
	async (_, { getState, extra: { sdk } }) => {
		const {
			wallet: { walletAddress, networkId },
		} = getState();

		if (walletAddress) {
			const balancesData = await sdk.synths.getSynthBalances(walletAddress);
			return balancesData;
		}
	}
);
