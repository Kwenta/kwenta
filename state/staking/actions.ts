import { createAsyncThunk } from '@reduxjs/toolkit';

import { monitorTransaction } from 'contexts/RelayerContext';
import { ThunkConfig } from 'state/types';

import { selectPeriods } from './selectors';

export const fetchStakingData = createAsyncThunk<any, void, ThunkConfig>(
	'staking/fetchStakingData',
	async (_, { extra: { sdk } }) => {
		const {
			rewardEscrowBalance,
			stakedNonEscrowedBalance,
			stakedEscrowedBalance,
			claimableBalance,
			kwentaBalance,
			weekCounter,
			totalStakedBalance,
			vKwentaBalance,
			vKwentaAllowance,
			kwentaAllowance,
			epochPeriod,
			veKwentaBalance,
			veKwentaAllowance,
		} = await sdk.kwentaToken.getStakingData();

		return {
			rewardEscrowBalance: rewardEscrowBalance.toString(),
			stakedNonEscrowedBalance: stakedNonEscrowedBalance.toString(),
			stakedEscrowedBalance: stakedEscrowedBalance.toString(),
			claimableBalance: claimableBalance.toString(),
			kwentaBalance: kwentaBalance.toString(),
			weekCounter,
			totalStakedBalance: totalStakedBalance.toString(),
			vKwentaBalance: vKwentaBalance.toString(),
			vKwentaAllowance: vKwentaAllowance.toString(),
			kwentaAllowance: kwentaAllowance.toString(),
			epochPeriod,
			veKwentaBalance: veKwentaBalance.toString(),
			veKwentaAllowance: veKwentaAllowance.toString(),
		};
	}
);

export const approveKwentaToken = createAsyncThunk<
	void,
	'kwenta' | 'vKwenta' | 'veKwenta',
	ThunkConfig
>('staking/approveKwentaToken', async (token, { dispatch, extra: { sdk } }) => {
	const hash = await sdk.kwentaToken.approveKwentaToken(token);

	monitorTransaction({
		txHash: hash,
		onTxConfirmed: () => {
			dispatch(fetchStakingData());
		},
	});
});

export const redeemToken = createAsyncThunk<void, 'vKwenta' | 'veKwenta', ThunkConfig>(
	'staking/redeemToken',
	async (token, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.kwentaToken.redeemToken(token);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

export const fetchEscrowData = createAsyncThunk<any, void, ThunkConfig>(
	'staking/fetchEscrowData',
	async (_, { extra: { sdk } }) => {
		const { totalVestable, escrowData } = await sdk.kwentaToken.getEscrowData();

		return { totalVestable, escrowData };
	}
);

export const vestEscrowedRewards = createAsyncThunk<any, number[], ThunkConfig>(
	'staking/vestEscrowedRewards',
	async (ids, { dispatch, extra: { sdk } }) => {
		if (ids.length > 0) {
			const hash = await sdk.kwentaToken.vestToken(ids);

			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch(fetchStakingData());
				},
			});
		}
	}
);

export const getReward = createAsyncThunk<any, void, ThunkConfig>(
	'staking/getReward',
	async (_, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.kwentaToken.getReward();

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

export const fetchClaimableRewards = createAsyncThunk<any, void, ThunkConfig>(
	'staking/fetchClaimableRewards',
	async (_, { getState, extra: { sdk } }) => {
		const periods = selectPeriods(getState());

		const { claimableRewards, totalRewards } = await sdk.kwentaToken.getClaimableRewards(periods);

		return { claimableRewards, totalRewards };
	}
);

export const claimMultipleRewards = createAsyncThunk<any, void, ThunkConfig>(
	'staking/claimMultipleRewards',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableRewards },
		} = getState();

		const hash = await sdk.kwentaToken.claimMultipleRewards(claimableRewards);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

export const stakeEscrow = createAsyncThunk<void, string, ThunkConfig>(
	'staking/stakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.kwentaToken.performStakeAction('stake', amount);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

export const unstakeEscrow = createAsyncThunk<void, string, ThunkConfig>(
	'staking/unstakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.kwentaToken.performStakeAction('unstake', amount);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

// TODO: Consider merging this with the (stake|unstake)Escrow actions.

export const stakeKwenta = createAsyncThunk<void, string, ThunkConfig>(
	'staking/stakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.kwentaToken.performStakeAction('stake', amount, { escrow: false });

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

export const unstakeKwenta = createAsyncThunk<void, string, ThunkConfig>(
	'staking/unstakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const hash = await sdk.kwentaToken.performStakeAction('unstake', amount, { escrow: false });

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);
