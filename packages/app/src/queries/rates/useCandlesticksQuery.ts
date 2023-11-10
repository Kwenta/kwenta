import { NetworkId } from '@kwenta/sdk/types'
import axios from 'axios'

import { getSupportedResolution } from 'components/TVChart/utils'
import { DEFAULT_NETWORK_ID } from 'constants/defaults'
import logError from 'utils/logError'
import proxy from 'utils/proxy'

import { DEFAULT_PYTH_TV_ENDPOINT } from './constants'
import { formatPythSymbol, mapPythCandles } from './utils'

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	period: number,
	networkId: NetworkId = DEFAULT_NETWORK_ID
) => {
	const pythTvEndpoint = DEFAULT_PYTH_TV_ENDPOINT

	if (period <= 3600) {
		const response = await axios
			.get(pythTvEndpoint, {
				params: {
					from: minTimestamp,
					to: maxTimestamp,
					symbol: formatPythSymbol(currencyKey!),
					resolution: getSupportedResolution(period),
				},
			})
			.then((response) => {
				return mapPythCandles(response.data)
			})
			.catch((err) => {
				logError(err)
				return []
			})

		return response
	} else {
		const { data } = await proxy.post('candles', {
			chain: networkId,
			options: {
				first: 999999,
				where: {
					synth: `${currencyKey}`,
					timestamp_gt: `${minTimestamp}`,
					timestamp_lt: `${maxTimestamp}`,
					period: `${period}`,
				},
				orderBy: 'timestamp',
				orderDirection: 'asc',
			},
			args: {
				id: true,
				synth: true,
				open: true,
				high: true,
				low: true,
				close: true,
				timestamp: true,
				average: true,
				period: true,
				aggregatedPrices: true,
			},
		})

		return data
	}
}
