import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'state/types';

import { monitorTransaction } from 'contexts/RelayerContext';

export const stakeTokens = createAsyncThunk<any, void, ThunkConfig>(
	'earn/stakeTokens',
	async (_, { getState, extra: { sdk } }) => {
		const {
			earn: { amount },
		} = getState();
		const hash = await sdk.token.changePoolTokens(amount, 'stake');

		if (hash) {
			monitorTransaction({
				txHash: hash,
			});
		}
	}
);

export const unstakeTokens = createAsyncThunk<any, void, ThunkConfig>(
	'earn/unstakeTokens',
	async (_, { getState, extra: { sdk } }) => {
		const {
			earn: { amount },
		} = getState();
		const hash = await sdk.token.changePoolTokens(amount, 'unstake');

		if (hash) {
			monitorTransaction({
				txHash: hash,
			});
		}
	}
);
