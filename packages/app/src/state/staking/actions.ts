import KwentaSDK from '@kwenta/sdk'
import { EscrowData } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'

import { notifyError } from 'components/ErrorNotifier'
import { monitorTransaction } from 'contexts/RelayerContext'
import { FetchStatus, ThunkConfig } from 'state/types'
import logError from 'utils/logError'

import { ZERO_STAKING_DATA } from './reducer'
import { StakingAction } from './types'

export const fetchStakingData = createAsyncThunk<StakingAction, void, ThunkConfig>(
	'staking/fetchStakingData',
	async (_, { getState, extra: { sdk } }) => {
		try {
			const { wallet } = getState()
			if (!wallet.walletAddress) return ZERO_STAKING_DATA

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
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch staking data', err)
			throw err
		}
	}
)

export const fetchStakingV2Data = createAsyncThunk<
	{
		rewardEscrowBalance: string
		stakedNonEscrowedBalance: string
		stakedEscrowedBalance: string
		claimableBalance: string
		totalStakedBalance: string
		stakedResetTime: number
		kwentaStakingV2Allowance: string
	},
	void,
	ThunkConfig
>('staking/fetchStakingDataV2', async (_, { extra: { sdk } }) => {
	try {
		const {
			rewardEscrowBalance,
			stakedNonEscrowedBalance,
			stakedEscrowedBalance,
			claimableBalance,
			totalStakedBalance,
			stakedResetTime,
			kwentaStakingV2Allowance,
		} = await sdk.kwentaToken.getStakingV2Data()

		return {
			rewardEscrowBalance: rewardEscrowBalance.toString(),
			stakedNonEscrowedBalance: stakedNonEscrowedBalance.toString(),
			stakedEscrowedBalance: stakedEscrowedBalance.toString(),
			claimableBalance: claimableBalance.toString(),
			totalStakedBalance: totalStakedBalance.toString(),
			stakedResetTime,
			kwentaStakingV2Allowance: kwentaStakingV2Allowance.toString(),
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch staking V2 data', err)
		throw err
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
			dispatch({ type: 'staking/setApproveKwentaStatus', payload: FetchStatus.Success })
			dispatch(fetchStakeMigrateData())
		},
		onTxFailed: () => {
			dispatch({ type: 'staking/setApproveKwentaStatus', payload: FetchStatus.Error })
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
				dispatch(fetchStakeMigrateData())
			},
		})
	}
)

export const fetchEscrowData = createAsyncThunk<
	{ escrowData: EscrowData<string>[]; totalVestable: string },
	void,
	ThunkConfig
>('staking/fetchEscrowData', async (_, { extra: { sdk } }) => {
	try {
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
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch escrow data', err)
		throw err
	}
})

export const fetchEscrowV2Data = createAsyncThunk<
	{ escrowData: EscrowData<string>[]; totalVestable: string },
	void,
	ThunkConfig
>('staking/fetchEscrowV2Data', async (_, { extra: { sdk } }) => {
	try {
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
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch escrow V2 data', err)
		throw err
	}
})

export const fetchEstimatedRewards = createAsyncThunk<
	{ estimatedKwentaRewards: string; estimatedOpRewards: string },
	void,
	ThunkConfig
>('staking/fetchEstimatedRewards', async (_, { extra: { sdk } }) => {
	try {
		const { estimatedKwentaRewards, estimatedOpRewards } =
			await sdk.kwentaToken.getEstimatedRewards()
		return {
			estimatedKwentaRewards: estimatedKwentaRewards.toString(),
			estimatedOpRewards: estimatedOpRewards.toString(),
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch estimated rewards', err)
		throw err
	}
})

export const fetchStakeMigrateData = createAsyncThunk<void, void, ThunkConfig>(
	'staking/fetchMigrateData',
	async (_, { dispatch }) => {
		dispatch(fetchStakingData())
		dispatch(fetchClaimableRewards())
		dispatch(fetchStakingV2Data())
		dispatch(fetchEscrowData())
		dispatch(fetchEscrowV2Data())
		dispatch(fetchEstimatedRewards())
	}
)

export const vestEscrowedRewards = createAsyncThunk<void, number[], ThunkConfig>(
	'staking/vestEscrowedRewards',
	async (ids, { dispatch, extra: { sdk } }) => {
		if (ids.length > 0) {
			const { hash } = await sdk.kwentaToken.vestToken(ids)

			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Success })
					dispatch(fetchStakeMigrateData())
				},
				onTxFailed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Error })
				},
			})
		}
	}
)

export const vestEscrowedRewardsV2 = createAsyncThunk<void, number[], ThunkConfig>(
	'staking/vestEscrowedRewardsV2',
	async (ids, { dispatch, extra: { sdk } }) => {
		if (ids.length > 0) {
			const { hash } = await sdk.kwentaToken.vestTokenV2(ids)

			monitorTransaction({
				txHash: hash,
				onTxConfirmed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Success })
					dispatch(fetchStakeMigrateData())
				},
				onTxFailed: () => {
					dispatch({ type: 'staking/setVestEscrowedRewardsStatus', payload: FetchStatus.Error })
				},
			})
		}
	}
)

export const claimStakingRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimStakingRewards',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.claimStakingRewards()

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const claimStakingRewardsV2 = createAsyncThunk<void, void, ThunkConfig>(
	'staking/claimStakingRewardsV2',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.claimStakingRewardsV2()

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setGetRewardStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const compoundRewards = createAsyncThunk<void, void, ThunkConfig>(
	'staking/compoundRewards',
	async (_, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.compoundRewards()

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setCompoundRewardsStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setCompoundRewardsStatus', payload: FetchStatus.Error })
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
	try {
		const {
			staking: { epochPeriod },
		} = getState()

		const { claimableRewards: claimableKwentaRewardsV2, totalRewards: kwentaRewardsV2 } =
			await sdk.kwentaToken.getClaimableAllRewards(epochPeriod, false, false, false, 9)

		const { claimableRewards: claimableOpRewards, totalRewards: opRewards } =
			await sdk.kwentaToken.getClaimableAllRewards(epochPeriod, false, true, false)

		const { claimableRewards: claimableSnxOpRewards, totalRewards: snxOpRewards } =
			await sdk.kwentaToken.getClaimableAllRewards(epochPeriod, false, true, true)

		return {
			claimableKwentaRewards: [claimableKwentaRewardsV2],
			claimableOpRewards,
			claimableSnxOpRewards,
			kwentaRewards: kwentaRewardsV2.toString(),
			opRewards: opRewards.toString(),
			snxOpRewards: snxOpRewards.toString(),
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch claimable rewards', err)
		throw err
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
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
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const stakeEscrowV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeEscrowV2',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeEscrowedKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeEscrowedStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const unstakeEscrowV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeEscrowV2',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeEscrowedKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeEscrowedStatus', payload: FetchStatus.Error })
			},
		})
	}
)

// TODO: Consider merging this with the (stake|unstake)Escrow actions.

export const stakeKwentaV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/stakeKwentaV2',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.stakeKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setStakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)

export const unstakeKwentaV2 = createAsyncThunk<void, BigNumber, ThunkConfig>(
	'staking/unstakeKwentaV2',
	async (amount, { dispatch, extra: { sdk } }) => {
		const { hash } = await sdk.kwentaToken.unstakeKwentaV2(amount)

		monitorTransaction({
			txHash: hash,
			onTxConfirmed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Success })
				dispatch(fetchStakeMigrateData())
			},
			onTxFailed: () => {
				dispatch({ type: 'staking/setUnstakeStatus', payload: FetchStatus.Error })
			},
		})
	}
)
