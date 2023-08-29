import { FuturesMarginType } from '@kwenta/sdk/types'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { selectOffchainPricesInfo, selectPrices } from 'state/prices/selectors'
import { RootState } from 'state/store'

export const selectFuturesType = (state: RootState) => state.futures.selectedType

export const selectFuturesState = createSelector(
	selectFuturesType,
	(state: RootState) => state,
	(type, state) => (type === FuturesMarginType.CROSS_MARGIN ? state.crossMargin : state.smartMargin)
)

export const selectMarketAsset = createSelector(
	selectFuturesState,
	(state) => state.selectedMarketAsset
)

export const selectMarketIndexPrice = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		const price = prices[marketAsset]
		// Note this assumes the order type is always delayed off chain
		return price?.offChain ?? price?.onChain ?? wei(0)
	}
)

export const selectMarketOnchainPrice = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		const price = prices[marketAsset]
		return price?.onChain ?? wei(0)
	}
)

export const selectMarketPriceInfo = createSelector(
	selectMarketAsset,
	selectOffchainPricesInfo,
	(asset, pricesInfo) => {
		if (!asset || !pricesInfo[asset]) return
		return pricesInfo[asset]
	}
)
