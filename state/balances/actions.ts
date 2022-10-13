import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'state/store';

export const fetchSynthBalances = createAsyncThunk<any, void, ThunkConfig>(
	'balances/fetchSynthBalances',
	async (_, { extra: { sdk } }) => {
		const { balances, balancesMap, totalUSDBalance } = await sdk.synths.getSynthBalances();

		return {
			balances: balances.map((b) => ({
				...b,
				balance: b.balance.toString(),
				usdBalance: b.usdBalance.toString(),
			})),
			balancesMap: Object.entries(balancesMap).reduce((acc, [key, value]) => {
				if (value) {
					acc[key] = {
						...value,
						balance: value.balance.toString(),
						usdBalance: value.usdBalance.toString(),
					};
				}

				return acc;
			}, {} as any),
			totalUSDBalance: totalUSDBalance.toString(),
		};
	}
);
