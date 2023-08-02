import { SynthV3BalancesAndAllowances } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import type { ThunkConfig } from 'state/store'
import { serializeBalances, serializeV3Balances } from 'utils/balances'

import { ZERO_BALANCES } from './reducer'
import { BalancesActionReturn } from './types'

export const fetchBalances = createAsyncThunk<BalancesActionReturn<string>, void, ThunkConfig>(
	'balances/fetchBalances',
	async (_, { getState, extra: { sdk } }) => {
		const { wallet } = getState()
		if (!wallet.walletAddress) return ZERO_BALANCES
		const [{ balancesMap, totalUSDBalance, susdWalletBalance }, tokenBalances] = await Promise.all([
			sdk.synths.getSynthBalances(wallet.walletAddress),
			sdk.exchange.getTokenBalances(wallet.walletAddress),
		])

		return serializeBalances(balancesMap, totalUSDBalance, tokenBalances, susdWalletBalance)
	}
)

export const fetchV3BalancesAndAllowances = createAsyncThunk<
	Partial<SynthV3BalancesAndAllowances<string>> | undefined,
	string[],
	ThunkConfig
>('balances/fetchV3BalancesAndAllowances', async (spenders, { getState, extra: { sdk } }) => {
	const { wallet } = getState()
	try {
		if (!wallet.walletAddress) return
		const res = await sdk.synths.getSynthV3BalancesAndAllowances(wallet.walletAddress, spenders)
		return serializeV3Balances(res)
	} catch (e) {
		notifyError('Error fetching v3 balances', e)
		throw e
	}
})
