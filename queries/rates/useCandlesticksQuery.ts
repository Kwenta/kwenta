import { ResolutionString } from 'public/static/charting_library/charting_library';
import { getCandles } from 'queries/futures/subgraph';
import { getRatesEndpoint, mapCandles } from './utils';

export const requestCandlesticks = async (
	currencyKey: string | null,
	minTimestamp: number,
	maxTimestamp = Math.floor(Date.now() / 1000),
	resolution: ResolutionString,
	networkId: number
) => {
	const ratesEndpoint = getRatesEndpoint(networkId);

	const period =
		resolution === '1'
			? 60
			: resolution === '5'
			? 300
			: resolution === '15'
			? 900
			: resolution === '60'
			? 3600
			: resolution === '1D'
			? 86400
			: 3600;

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
};
