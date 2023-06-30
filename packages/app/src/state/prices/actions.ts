import { SynthPrice, PricesMap, PriceType } from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { selectPrices } from 'state/prices/selectors'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { getPricesInfo } from 'utils/prices'

import { setOffChainPrices, setOnChainPrices } from './reducer'

export const updatePrices = (newPrices: PricesMap<string>, type: PriceType): AppThunk => (
	dispatch,
	getState
) => {
	const { prices } = getState()
	if (type === 'off_chain') {
		dispatch(setOffChainPrices(getPricesInfo(prices.offChainPrices, newPrices)))
	} else {
		dispatch(setOnChainPrices(getPricesInfo(prices.onChainPrices, newPrices)))
	}
}

export const fetchPreviousDayPrices = createAsyncThunk<
	SynthPrice[],
	boolean | undefined,
	ThunkConfig
>('prices/fetchPreviousDayPrices', async (mainnet, { getState, extra: { sdk } }) => {
	try {
		const prices = selectPrices(getState())
		const marketAssets = Object.keys(prices)

		const laggedPrices = await sdk.prices.getPreviousDayPrices(
			marketAssets,
			mainnet ? 10 : undefined
		)

		return laggedPrices
	} catch (err) {
		notifyError('Failed to fetch historical prices', err)
		throw err
	}
})
