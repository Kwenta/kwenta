import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'state/types';

export const stakeTokens = createAsyncThunk<any, void, ThunkConfig>(
	'earn/stakeTokens',
	async (_, { getState }) => {}
);

export const unstakeTokens = createAsyncThunk<any, void, ThunkConfig>(
	'earn/unstakeTokens',
	async (_, { getState }) => {}
);
