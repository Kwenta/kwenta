import axios from 'axios';

import { getSupportedResolution } from 'components/TVChart/utils';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { getCandles } from 'queries/futures/subgraph';
import { NetworkId } from 'sdk/types/common';
import { getRatesEndpoint } from 'sdk/utils/prices';
import logError from 'utils/logError';

import { mapCandles, mapPythCandles } from './utils';

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	period: number,
	networkId: NetworkId = DEFAULT_NETWORK_ID
) => {
	const ratesEndpoint = getRatesEndpoint(networkId);
	const pythTvEndpoint = 'https://pyth-api.vintage-orange-muffin.com/v2/history';

	if (period <= 3600) {
		const response = await axios
			.get(pythTvEndpoint, {
				params: {
					from: minTimestamp,
					to: maxTimestamp,
					symbol: `${currencyKey}/USD`,
					resolution: getSupportedResolution(period),
				},
			})
			.then((response) => {
				return mapPythCandles(response.data);
			})
			.catch((err) => {
				logError(err);
				return [];
			});

		return response;
	} else {
		const response = await getCandles(
			ratesEndpoint,
			{
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
			{
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
			}
		).then((response) => {
			return mapCandles(response);
		});
		return response;
	}
};
