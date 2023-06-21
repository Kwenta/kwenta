import { createAsyncThunk } from '@reduxjs/toolkit'

import type { ThunkConfig } from 'state/store'
import { serializeBalances } from 'utils/balances'

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
