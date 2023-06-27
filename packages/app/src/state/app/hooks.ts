import { useEffect } from 'react'

import { fetchBalances } from 'state/balances/actions'
import sdk from 'state/config'
import { fetchEarnTokenPrices } from 'state/earn/actions'
import { selectMarkets } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks'
import { fetchPreviousDayPrices, updatePrices } from 'state/prices/actions'
import { setConnectionError } from 'state/prices/reducer'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { serializePrices } from 'utils/futures'

import { checkSynthetixStatus } from './actions'

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch()
	const wallet = useAppSelector(selectWallet)
	const markets = useAppSelector(selectMarkets)
	const network = useAppSelector(selectNetwork)

	usePollAction('fetchEarnTokenPrices', fetchEarnTokenPrices, {
		intervalTime: 60000 * 10,
		dependencies: [wallet],
		disabled: !wallet,
	})

	usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet, network] })

	usePollAction('fetchPreviousDayPrices', fetchPreviousDayPrices, {
		intervalTime: 60000 * 15,
		dependencies: [markets.length, network],
		disabled: !markets.length,
	})

	usePollAction('checkSynthetixStatus', checkSynthetixStatus, {
		intervalTime: 2 * 60 * 1000,
		dependencies: [network],
	})

	useEffect(() => {
		if (ready) {
			sdk.prices.startPriceUpdates(15000)
		}
	}, [ready])

	useEffect(() => {
		sdk.prices.onPricesUpdated(({ prices, type, source }) => {
			dispatch(updatePrices(serializePrices(prices), type))
			if (source === 'stream') {
				// must be connected again, remove any error
				dispatch(setConnectionError(null))
			}
		})

		sdk.prices.onPricesConnectionUpdated(({ error }) => {
			dispatch(setConnectionError(error?.message))
		})

		return () => {
			sdk.prices.removePricesListeners()
			sdk.prices.removeConnectionListeners()
		}
	}, [dispatch])
}
