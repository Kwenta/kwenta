import { createAsyncThunk } from '@reduxjs/toolkit';

import { monitorTransaction } from 'contexts/RelayerContext';
import { ThunkConfig } from 'state/types';

export const approveLPToken = createAsyncThunk<void, void, ThunkConfig>(
	'earn/approveLPToken',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.approveLPToken();

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(getEarnDetails());
				},
			});
		}
	}
);

export const stakeTokens = createAsyncThunk<void, string, ThunkConfig>(
	'earn/stakeTokens',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.changePoolTokens(amount, 'stake');

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(getEarnDetails());
				},
			});
		}
	}
);

export const unstakeTokens = createAsyncThunk<void, string, ThunkConfig>(
	'earn/unstakeTokens',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.changePoolTokens(amount, 'withdraw');

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(getEarnDetails());
				},
			});
		}
	}
);

export const claimRewards = createAsyncThunk<void, void, ThunkConfig>(
	'earn/claimRewards',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.claimRewards();

		if (hash) {
			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(getEarnDetails());
				},
			});
		}
	}
);

export const getEarnDetails = createAsyncThunk<void, string | undefined, ThunkConfig>(
	'earn/getEarnDetails',
	async (_, { dispatch, extra: { sdk } }) => {
		const {
			balance,
			earned,
			endDate,
			rewardRate,
			totalSupply,
			lpTokenBalance,
			allowance,
			wethAmount,
			kwentaAmount,
			lpTotalSupply,
		} = await sdk.kwentaToken.getEarnDetails();

		dispatch({
			type: 'earn/setEarnDetails',
			payload: {
				balance: balance.toString(),
				earnedRewards: earned.toString(),
				endDate,
				rewardRate: rewardRate.toString(),
				totalSupply: totalSupply.toString(),
				lpTokenBalance: lpTokenBalance.toString(),
				allowance: allowance.toString(),
				wethAmount: wethAmount.toString(),
				kwentaAmount: kwentaAmount.toString(),
				lpTotalSupply: lpTotalSupply.toString(),
			},
		});
	}
);

export const fetchEarnTokenPrices = createAsyncThunk<
	{
		kwentaPrice: string;
		wethPrice: string;
	},
	void,
	ThunkConfig
>('earn/fetchEarnTokenPrices', async (_, { extra: { sdk } }) => {
	const { kwentaPrice, wethPrice } = await sdk.kwentaToken.getEarnTokenPrices();

	return {
		kwentaPrice: kwentaPrice.toString(),
		wethPrice: wethPrice.toString(),
	};
});
