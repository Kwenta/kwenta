import { createSlice } from '@reduxjs/toolkit';
import { FetchStatus } from 'state/types';

import { fetchSynthBalances } from './actions';

type BalancesState = {
	status: FetchStatus;
	error: string | undefined;
	balances: any[];
	balancesMap: any;
	totalUSDBalance?: string;
	susdWalletBalance?: string;
};

const initialState: BalancesState = {
	status: FetchStatus.Idle,
	balances: [],
	balancesMap: {},
	totalUSDBalance: undefined,
	susdWalletBalance: undefined,
	error: undefined,
};

const balancesSlice = createSlice({
	name: 'balances',
	initialState,
	reducers: {
		setBalances: (state, action) => {
			state.balances = action.payload.balances;
			state.totalUSDBalance = action.payload.totalUSDBalance;
		},
		clearBalances: (state) => {
			state.balances = [];
			state.balancesMap = {};
			state.totalUSDBalance = undefined;
			state.susdWalletBalance = undefined;
			state.error = undefined;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(fetchSynthBalances.pending, (state) => {
			state.status = FetchStatus.Loading;
		});
		builder.addCase(fetchSynthBalances.fulfilled, (state, action) => {
			state.status = FetchStatus.Success;
			state.balances = action.payload.balances;
			state.totalUSDBalance = action.payload.totalUSDBalance;
			state.balancesMap = action.payload.balancesMap;
			state.susdWalletBalance = action.payload.susdWalletBalance;
		});
		builder.addCase(fetchSynthBalances.rejected, (state) => {
			state.status = FetchStatus.Error;
		});
	},
});

export const { setBalances } = balancesSlice.actions;

export default balancesSlice.reducer;
