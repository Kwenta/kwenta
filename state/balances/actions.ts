import { createAsyncThunk } from '@reduxjs/toolkit';
import type { ThunkConfig } from 'state/store';

export const fetchSynthBalances = createAsyncThunk<any, string, ThunkConfig>(
	'balances/fetchSynthBalances',
	async (walletAddress, { extra: { sdk } }) => {
		const [{ balances, balancesMap, totalUSDBalance }, tokenBalances] = await Promise.all([
			sdk.synths.getSynthBalances(walletAddress),
			sdk.exchange.getTokenBalances(walletAddress),
		]);

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
			susdWalletBalance: balancesMap?.['sUSD']?.balance.toString() ?? '0',
			tokenBalances: Object.entries(tokenBalances).reduce((acc, [key, value]) => {
				if (value) {
					acc[key] = { ...value, balance: value.balance.toString() };
				}

				return acc;
			}, {} as any),
		};
	}
);
