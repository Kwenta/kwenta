import { getCandles } from 'queries/futures/subgraph';
import { NetworkId } from 'sdk/types/common';

import { getRatesEndpoint, mapCandles, mapPriceChart } from './utils';

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	period: number,
	networkId: number,
	limit?: number,
	orderDirection: 'asc' | 'desc' | undefined = 'asc',
	priceChart?: boolean | null
) => {
	const ratesEndpoint = getRatesEndpoint(networkId as NetworkId);

	const response = await getCandles(
		ratesEndpoint,
		{
			first: limit ?? 999999,
			where: {
				synth: `${currencyKey}`,
				timestamp_gt: `${minTimestamp}`,
				timestamp_lt: `${maxTimestamp}`,
				period: `${period}`,
			},
			orderBy: 'timestamp',
			orderDirection,
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
		return priceChart ? mapPriceChart(response) : mapCandles(response);
	});
	return response;
};
