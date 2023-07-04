import { createSelector } from '@reduxjs/toolkit'

import { RootState } from 'state/store'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { unserializeMarkets } from 'utils/futures'

export const selectV3Markets = createSelector(
	selectNetwork,
	(state: RootState) => state.perpsV3,
	(network, perpsV3) =>
		perpsV3.markets[network] ? unserializeMarkets(perpsV3.markets[network]) : []
)

export const selectPerpsV3SupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10 || state.wallet.networkId === 420

export const selectPerpsV3Account = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.perpsV3,
	(wallet, network, perpsV3) => {
		return wallet ? perpsV3.accounts[network]?.[wallet]?.account : undefined
	}
)
