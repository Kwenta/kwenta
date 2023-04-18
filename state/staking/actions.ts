import { createAsyncThunk } from '@reduxjs/toolkit';
import { BigNumber } from 'ethers';
import KwentaSDK from 'sdk';

import { monitorTransaction } from 'contexts/RelayerContext';
import { EscrowData } from 'sdk/services/kwentaToken';
import { FetchStatus, ThunkConfig } from 'state/types';

export const fetchStakingData = createAsyncThunk<
	{
		rewardEscrowBalance: string;
		stakedNonEscrowedBalance: string;
		stakedEscrowedBalance: string;
		claimableBalance: string;
		kwentaBalance: string;
		weekCounter: number;
		totalStakedBalance: string;
		vKwentaBalance: string;
		vKwentaAllowance: string;
		kwentaAllowance: string;
		epochPeriod: number;
		veKwentaBalance: string;
		veKwentaAllowance: string;
	},
	void,
	ThunkConfig
>('staking/fetchStakingData', async (_, { extra: { sdk } }) => {
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
});

export const approveKwentaToken = createAsyncThunk<
	void,
	'kwenta' | 'vKwenta' | 'veKwenta',
	ThunkConfig
>('staking/approveKwentaToken', async (token, { dispatch, extra: { sdk } }) => {
	const { hash } = await sdk.kwentaToken.approveKwentaToken(token);

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
		const { hash } = await sdk.kwentaToken.redeemToken(
			token === 'vKwenta' ? 'vKwentaRedeemer' : 'veKwentaRedeemer',
			{ hasAddress: token === 'veKwenta' }
		);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData());
			},
		});
	}
);

export const fetchEscrowData = createAsyncThunk<
	{ escrowData: EscrowData<string>[]; totalVestable: string },
	void,
	ThunkConfig
>('staking/fetchEscrowData', async (_, { extra: { sdk } }) => {
	const { escrowData, totalVestable } = await sdk.kwentaToken.getEscrowData();

	return {
		escrowData: escrowData.map((e) => ({
			...e,
			vestable: e.vestable.toString(),
			amount: e.amount.toString(),
			fee: e.fee.toString(),
		})),
		totalVestable: totalVestable.toString(),
	};
});

export const vestEscrowedRewards = createAsyncThunk<void, number[], ThunkConfig>(
	'staking/vestEscrowedRewards',
	async (ids, { dispatch, extra: { sdk } }) => {
		if (ids.length > 0) {
			const { hash } = await sdk.kwentaToken.vestToken(ids);

			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Success });
					dispatch(fetchStakingData());
				},
				onTxFailed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Error });
				},
			});
		}
	}
);

export const getReward = createAsyncThunk<void, void, ThunkConfig>(
	'staking/getReward',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.getReward();

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Error });
			},
		});
	}
);

export const fetchClaimableRewards = createAsyncThunk<
	{
		claimableRewards: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards'][];
		totalRewards: string;
	},
	void,
	ThunkConfig
>('staking/fetchClaimableRewards', async (_, { getState, extra: { sdk } }) => {
	const {
		staking: { epochPeriod },
	} = getState();

	const {
		claimableRewards: claimableRewardsV1,
		totalRewards: totalRewardsV1,
	} = await sdk.kwentaToken.getClaimableRewards(epochPeriod, true);

	const {
		claimableRewards: claimableRewardsV2,
		totalRewards: totalRewardsV2,
	} = await sdk.kwentaToken.getClaimableRewards(epochPeriod, false);

	return {
		claimableRewards: [claimableRewardsV1, claimableRewardsV2],
		totalRewards: totalRewardsV1.add(totalRewardsV2).toString(),
	};
});

export const fetchClaimableRewardsAll = createAsyncThunk<
	{
		claimableRewards: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards'][];
		claimableRewardsAll: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards'][];
		claimableRewardsOp: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards'];
		totalRewards: string;
		kwentaOpRewards: string;
		snxOpRewards: string;
	},
	void,
	ThunkConfig
>('staking/fetchClaimableRewardsAll', async (_, { getState, extra: { sdk } }) => {
	const {
		staking: { epochPeriod },
	} = getState();

	const {
		claimableRewards: claimableRewardsV1,
		totalRewards: totalRewardsV1,
	} = await sdk.kwentaToken.getClaimableRewardsAll(epochPeriod, true);

	const {
		claimableRewards: claimableRewardsV2,
		totalRewards: totalRewardsV2,
	} = await sdk.kwentaToken.getClaimableRewardsAll(epochPeriod, false);

	const {
		claimableRewards: claimableRewardsOp,
		totalRewards: totalRewardsOp,
	} = await sdk.kwentaToken.getClaimableRewardsAll(epochPeriod, false, true);

	return {
		claimableRewards: [claimableRewardsV1, claimableRewardsV2],
		claimableRewardsAll: [claimableRewardsV1, claimableRewardsV2, claimableRewardsOp],
		claimableRewardsOp,
		totalRewards: totalRewardsV1.add(totalRewardsV2).toString(),
		kwentaOpRewards: totalRewardsOp.toString(),
		snxOpRewards: totalRewardsOp.toString(),
	};
});

export const claimMultipleRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleRewards',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableRewards },
		} = getState();

		const { hash } = await sdk.kwentaToken.claimMultipleRewards(claimableRewards);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimRewardsStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
				dispatch(fetchClaimableRewards());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimRewardsStatus', payload: FetchStatus.Error });
			},
		});
	}
);

export const claimMultipleRewardsAll = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleRewardsAll',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableRewardsAll },
		} = getState();

		const { hash } = await sdk.kwentaToken.claimMultipleRewards(claimableRewardsAll);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimRewardsStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
				dispatch(fetchClaimableRewards());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimRewardsStatus', payload: FetchStatus.Error });
			},
		});
	}
);

export const claimMultipleRewardsOp = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleRewardsOp',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableRewardsOp },
		} = getState();

		const { hash } = await sdk.kwentaToken.claimOpRewards(claimableRewardsOp);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimRewardsStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
				dispatch(fetchClaimableRewards());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimRewardsStatus', payload: FetchStatus.Error });
			},
		});
	}
);

export const stakeEscrow = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeEscrowedKwenta(amount);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Error });
			},
		});
	}
);

export const unstakeEscrow = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeEscrowedKwenta(amount);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Error });
			},
		});
	}
);

// TODO: Consider merging this with the (stake|unstake)Escrow actions.

export const stakeKwenta = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeKwenta(amount);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Error });
			},
		});
	}
);

export const unstakeKwenta = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeKwenta(amount);

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Success });
				dispatch(fetchStakingData());
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Error });
			},
		});
	}
);
