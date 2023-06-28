import KwentaSDK from '@kwenta/sdk'
import { EscrowData } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'

import { monitorTransaction } from 'contexts/RelayerContext'
import { FetchStatus, ThunkConfig } from 'state/types'

export const fetchStakingData = createAsyncThunk<
	{
		rewardEscrowBalance: string
		stakedNonEscrowedBalance: string
		stakedEscrowedBalance: string
		claimableBalance: string
		kwentaBalance: string
		weekCounter: number
		totalStakedBalance: string
		vKwentaBalance: string
		vKwentaAllowance: string
		kwentaAllowance: string
		epochPeriod: number
		veKwentaBalance: string
		veKwentaAllowance: string
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
	} = await sdk.kwentaToken.getStakingData()

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
	}
})

export const fetchStakingV2Data = createAsyncThunk<
	{
		rewardEscrowBalance: string
		stakedNonEscrowedBalance: string
		stakedEscrowedBalance: string
		claimableBalance: string
		totalStakedBalance: string
		kwentaStakingV2Allowance: string
	},
	void,
	ThunkConfig
>('staking/fetchStakingDataV2', async (_, { extra: { sdk } }) => {
	const {
		rewardEscrowBalance,
		stakedNonEscrowedBalance,
		stakedEscrowedBalance,
		claimableBalance,
		totalStakedBalance,
		kwentaStakingV2Allowance,
	} = await sdk.kwentaToken.getStakingV2Data()

	return {
		rewardEscrowBalance: rewardEscrowBalance.toString(),
		stakedNonEscrowedBalance: stakedNonEscrowedBalance.toString(),
		stakedEscrowedBalance: stakedEscrowedBalance.toString(),
		claimableBalance: claimableBalance.toString(),
		totalStakedBalance: totalStakedBalance.toString(),
		kwentaStakingV2Allowance: kwentaStakingV2Allowance.toString(),
	}
})

export const approveKwentaToken = createAsyncThunk<
	void,
	'kwenta' | 'vKwenta' | 'veKwenta' | 'kwentaStakingV2',
	ThunkConfig
>('staking/approveKwentaToken', async (token, { dispatch, extra: { sdk } }) => {
	const { hash } = await sdk.kwentaToken.approveKwentaToken(token)

	monitorTransaction({
		txHash: hash,
		onTxConfirmed: () => {
			dispatch(fetchStakingData())
		},
	})
})

export const redeemToken = createAsyncThunk<void, 'vKwenta' | 'veKwenta', ThunkConfig>(
	'staking/redeemToken',
	async (token, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.redeemToken(
			token === 'vKwenta' ? 'vKwentaRedeemer' : 'veKwentaRedeemer',
			{ hasAddress: token === 'veKwenta' }
		)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch(fetchStakingData())
			},
		})
	}
)

export const fetchEscrowData = createAsyncThunk<
	{ escrowData: EscrowData<string>[]; totalVestable: string },
	void,
	ThunkConfig
>('staking/fetchEscrowData', async (_, { extra: { sdk } }) => {
	const { escrowData, totalVestable } = await sdk.kwentaToken.getEscrowData()

	return {
		escrowData: escrowData.map((e) => ({
			...e,
			vestable: e.vestable.toString(),
			amount: e.amount.toString(),
			fee: e.fee.toString(),
		})),
		totalVestable: totalVestable.toString(),
	}
})

export const fetchEscrowV2Data = createAsyncThunk<
	{ escrowData: EscrowData<string>[]; totalVestable: string },
	void,
	ThunkConfig
>('staking/fetchEscrowV2Data', async (_, { extra: { sdk } }) => {
	const { escrowData, totalVestable } = await sdk.kwentaToken.getEscrowV2Data()

	return {
		escrowData: escrowData.map((e) => ({
			...e,
			vestable: e.vestable.toString(),
			amount: e.amount.toString(),
			fee: e.fee.toString(),
		})),
		totalVestable: totalVestable.toString(),
	}
})

export const vestEscrowedRewards = createAsyncThunk<void, number[], ThunkConfig>(
	'staking/vestEscrowedRewards',
	async (ids, { dispatch, extra: { sdk } }) => {
		if (ids.length > 0) {
			const { hash } = await sdk.kwentaToken.vestToken(ids)

			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Success })
					dispatch(fetchStakingData())
				},
				onTxFailed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Error })
				},
			})
		}
	}
)

export const vestEscrowedRewardsV2 = createAsyncThunk<void, number[], ThunkConfig>(
	'staking/vestEscrowedRewards',
	async (ids, { dispatch, extra: { sdk } }) => {
		if (ids.length > 0) {
			const { hash } = await sdk.kwentaToken.vestTokenV2(ids)

			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Success })
					dispatch(fetchStakingData())
				},
				onTxFailed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Error })
				},
			})
		}
	}
)

export const getReward = createAsyncThunk<void, void, ThunkConfig>(
	'staking/getReward',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.getReward()

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const getRewardV2 = createAsyncThunk<void, void, ThunkConfig>(
	'staking/getReward',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.getRewardV2()

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const fetchClaimableRewards = createAsyncThunk<
	{
		claimableKwentaRewards: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards'][]
		claimableOpRewards: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards']
		claimableSnxOpRewards: Awaited<
			ReturnType<KwentaSDK['kwentaToken']['getClaimableRewards']>
		>['claimableRewards']
		kwentaRewards: string
		opRewards: string
		snxOpRewards: string
	},
	void,
	ThunkConfig
>('staking/fetchClaimableRewards', async (_, { getState, extra: { sdk } }) => {
	const {
		staking: { epochPeriod },
	} = getState()

	const {
		claimableRewards: claimableKwentaRewardsV1,
		totalRewards: kwentaRewardsV1,
	} = await sdk.kwentaToken.getClaimableAllRewards(epochPeriod)

	const {
		claimableRewards: claimableKwentaRewardsV2,
		totalRewards: kwentaRewardsV2,
	} = await sdk.kwentaToken.getClaimableAllRewards(epochPeriod, false, false, false)

	const {
		claimableRewards: claimableOpRewards,
		totalRewards: opRewards,
	} = await sdk.kwentaToken.getClaimableAllRewards(epochPeriod, false, true, false)

	const {
		claimableRewards: claimableSnxOpRewards,
		totalRewards: snxOpRewards,
	} = await sdk.kwentaToken.getClaimableAllRewards(epochPeriod, false, true, true)

	return {
		claimableKwentaRewards: [claimableKwentaRewardsV1, claimableKwentaRewardsV2],
		claimableOpRewards,
		claimableSnxOpRewards,
		kwentaRewards: kwentaRewardsV1.add(kwentaRewardsV2).toString(),
		opRewards: opRewards.toString(),
		snxOpRewards: snxOpRewards.toString(),
	}
})

export const claimMultipleAllRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleAllRewards',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableKwentaRewards, claimableOpRewards, claimableSnxOpRewards },
		} = getState()

		const { hash } = await sdk.kwentaToken.claimMultipleAllRewards([
			...claimableKwentaRewards,
			claimableOpRewards,
			claimableSnxOpRewards,
		])

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimAllRewardsStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
				dispatch(fetchClaimableRewards())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimAllRewardsStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const claimMultipleKwentaRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleKwentaRewards',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableKwentaRewards },
		} = getState()

		const { hash } = await sdk.kwentaToken.claimMultipleKwentaRewards(claimableKwentaRewards)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimKwentaRewardsStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
				dispatch(fetchClaimableRewards())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimKwentaRewardsStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const claimMultipleOpRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleOpRewards',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableOpRewards },
		} = getState()

		const { hash } = await sdk.kwentaToken.claimOpRewards(claimableOpRewards, false)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimOpRewardsStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
				dispatch(fetchClaimableRewards())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimOpRewardsStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const claimMultipleSnxOpRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimMultipleSnxOpRewards',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const {
			staking: { claimableSnxOpRewards },
		} = getState()

		const { hash } = await sdk.kwentaToken.claimOpRewards(claimableSnxOpRewards, true)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setClaimSnxOpRewardsStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
				dispatch(fetchClaimableRewards())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setClaimSnxOpRewardsStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const stakeEscrow = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeEscrowedKwenta(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const unstakeEscrow = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeEscrowedKwenta(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Error })
			},
		})
	}
)

// TODO: Consider merging this with the (stake|unstake)Escrow actions.

export const stakeKwenta = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeKwenta(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const unstakeKwenta = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeKwenta(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const stakeEscrowV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeEscrowedKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const unstakeEscrowV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeEscrow',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeEscrowedKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Error })
			},
		})
	}
)

// TODO: Consider merging this with the (stake|unstake)Escrow actions.

export const stakeKwentaV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const unstakeKwentaV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeKwenta',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Success })
				dispatch(fetchStakingData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)
