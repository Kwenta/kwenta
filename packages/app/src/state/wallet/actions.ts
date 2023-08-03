import { createAsyncThunk } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/browser'
import { ethers } from 'ethers'

import { fetchBalances } from 'state/balances/actions'
import { fetchClaimableRewards } from 'state/staking/actions'
import type { ThunkConfig } from 'state/types'

import { setWalletAddress } from './reducer'

export const resetWalletAddress = createAsyncThunk<void, string | undefined, ThunkConfig>(
	'wallet/resetWalletAddress',
	async (walletAddress, { dispatch }) => {
		dispatch(setWalletAddress(walletAddress))
		dispatch(fetchBalances())
		dispatch(fetchClaimableRewards())
	}
)

export const setSigner = createAsyncThunk<void, ethers.Signer | null | undefined, ThunkConfig>(
	'wallet/setSigner',
	async (signer, { dispatch, extra: { sdk } }) => {
		if (!!signer) {
			const [address] = await Promise.all([signer?.getAddress(), sdk.setSigner(signer)])
			Sentry.setUser({ id: address })
			dispatch(resetWalletAddress(address))
		} else {
			dispatch(resetWalletAddress(undefined))
			dispatch({ type: 'balances/clearBalances' })
		}
	}
)
