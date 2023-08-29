import { Prices } from '@kwenta/sdk/types'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { RootState } from 'state/store'
import { getPricesForCurrencies } from 'utils/currencies'
import { deserializePricesInfo } from 'utils/prices'

export const selectPrices = createSelector(
	(state: RootState) => state.prices,
	({ onChainPrices, offChainPrices }) => {
		const merged: Prices = {}
		Object.entries(onChainPrices).forEach(([key, { price }]) => {
			merged[key] = {
				onChain: wei(price),
			}
		})
		Object.entries(offChainPrices).forEach(([key, { price }]) => {
			if (merged[key]) {
				merged[key].offChain = wei(price)
			} else {
				merged[key] = {
					offChain: wei(price),
				}
			}
		})
		return merged
	}
)

export const selectOffchainPricesInfo = createSelector(
	(state: RootState) => state.prices.offChainPrices,
	(offChainPrices) => deserializePricesInfo(offChainPrices)
)

export const selectOnChainPricesInfo = (state: RootState) =>
	deserializePricesInfo(state.prices.onChainPrices)

export const selectPreviousDayPrices = (state: RootState) => state.prices.previousDayPrices

export const selectLatestEthPrice = createSelector(selectPrices, (prices) => {
	const price = getPricesForCurrencies(prices, 'sETH', 'sUSD')
	return price.offChain ?? price.onChain ?? wei(0)
})

export const selectPricesConnectionError = (state: RootState) => state.prices.connectionError
