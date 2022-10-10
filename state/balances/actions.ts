import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'state/store';

export const fetchSynthBalances = createAsyncThunk<any, void, ThunkConfig>(
	'balances/fetchSynthBalances',
	async (_, { extra: { sdk } }) => {
		const { balances, totalUSDBalance } = await sdk.synths.getSynthBalances();

		return { balances, totalUSDBalance: totalUSDBalance.toString() };
	}
);
