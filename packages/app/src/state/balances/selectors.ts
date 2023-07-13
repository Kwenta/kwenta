import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from 'state/store'
import { FetchStatus } from 'state/types'
import { unserializeBalances, unserializeV3Balances } from 'utils/balances'

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

export const selectSNXUSDBalance = createSelector(
	(state: RootState) => state.balances.synthV3Balances.SNXUSD?.balance ?? '0',
	(bal) => toWei(bal)
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

export const selectSynthV3Balances = createSelector(
	(state: RootState) => state.balances.synthV3Balances,
	(synthV3Balances) => unserializeV3Balances(synthV3Balances)
)
