import { createSlice } from '@reduxjs/toolkit';

enum FetchStatus {
	Idle,
	Loading,
	Success,
	Error,
}

type BalancesState = {
	data: any[];
	status: FetchStatus;
	error: string | undefined;
};

const initialState: BalancesState = {
	status: FetchStatus.Idle,
	data: [],
	error: undefined,
};

const balancesSlice = createSlice({
	name: 'balances',
	initialState,
	reducers: {
		setBalances: (state, action) => {
			state.data = action.payload.balances;
		},
	},
});

export default balancesSlice.reducer;
