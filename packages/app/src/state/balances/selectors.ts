import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from 'state/store'
import { FetchStatus } from 'state/types'

import { unserializeBalances } from 'utils/balances'

export const selectBalancesFetchStatus = (state: RootState) => state.balances.status

export const selectTotalUSDBalanceWei = createSelector(
	(state: RootState) => state.balances.totalUSDBalance,
	(totalUSDBalance) => toWei(totalUSDBalance)
)

export const selectSynthBalancesLoading = createSelector(
	(state: RootState) => state.balances.status,
	(status) => status === FetchStatus.Loading
)

export const selectSusdBalance = createSelector(
	(state: RootState) => state.balances.susdWalletBalance,
	(susdWalletBalance) => toWei(susdWalletBalance)
)

export const selectBalances = createSelector(
	(state: RootState) => state.balances,
	(balances) => {
		return unserializeBalances(
			balances.synthBalancesMap,
			balances.totalUSDBalance || '0',
			balances.tokenBalances,
			balances.susdWalletBalance || '0'
		)
	}
)
