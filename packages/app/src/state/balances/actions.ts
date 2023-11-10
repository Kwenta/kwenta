import { SynthV3BalancesAndAllowances } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import type { ThunkConfig } from 'state/store'
import { serializeBalances, serializeV3Balances } from 'utils/balances'
import proxy from 'utils/proxy'

import { ZERO_BALANCES } from './reducer'
import { BalancesActionReturn } from './types'

export const fetchBalances = createAsyncThunk<BalancesActionReturn<string>, void, ThunkConfig>(
	'balances/fetchBalances',
	async (_, { getState }) => {
		const { wallet } = getState()
		if (!wallet.walletAddress) return ZERO_BALANCES
		const [{ balancesMap, totalUSDBalance, susdWalletBalance }, tokenBalances] = await Promise.all([
			proxy
				.get('synths/synth-balances', {
					params: {
						address: wallet.walletAddress,
					},
				})
				.then((response) => response.data),
			proxy
				.get('exchange/token-balances', {
					params: {
						address: wallet.walletAddress,
					},
				})
				.then((response) => response.data),
		])

		return serializeBalances(balancesMap, totalUSDBalance, tokenBalances, susdWalletBalance)
	}
)

export const fetchV3BalancesAndAllowances = createAsyncThunk<
	Partial<SynthV3BalancesAndAllowances<string>> | undefined,
	string[],
	ThunkConfig
>('balances/fetchV3BalancesAndAllowances', async (spenders, { getState }) => {
	const { wallet } = getState()
	try {
		if (!wallet.walletAddress) return
		const res = await proxy
			.get('synths/syncth-v3-balance-and-allowances', {
				params: {
					address: wallet.walletAddress,
					spenders,
				},
			})
			.then((response) => response.data)
		return serializeV3Balances(res)
	} catch (e) {
		notifyError('Error fetching v3 balances', e)
		throw e
	}
})
