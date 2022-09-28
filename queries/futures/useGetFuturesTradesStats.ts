import { useQuery } from 'react-query';
import { chainId } from 'wagmi';

import logError from 'utils/logError';

import { getFuturesHourlyStats } from './subgraph';
import { getFuturesEndpoint } from './utils';

interface T {
	date: string;
	tradesByPeriod: number;
	totalTrades: number;
}

export const useGetFuturesTradesStats = () => {
	const futuresEndpoint = getFuturesEndpoint(chainId.optimism);

	const query = async () => {
		try {
			const response = await getFuturesHourlyStats(
				futuresEndpoint,
				{
					first: 999999,
					orderBy: 'timestamp',
					orderDirection: 'asc',
				},
				{
					// asset: true,
					// id: true,
					timestamp: true,
					trades: true,
					volume: true,
				}
			);

			const result: T[] = [];

			const map = new Map();

			response.forEach((res) => {
				const date = new Date(Number(res.timestamp) * 1000).toISOString().split('T')[0];

				if (!map.has(date)) {
					map.set(date, Number(res.trades));
				} else {
					map.set(date, map.get(date) + Number(res.trades));
				}
			});

			let sum = 0;

			map.forEach((tradesByPeriod, date) => {
				sum += result.length > 0 ? result[result.length - 1].tradesByPeriod : 0;
				result.push({
					date,
					tradesByPeriod,
					totalTrades: tradesByPeriod + sum,
				});
			});

			return result;
		} catch (e) {
			logError(e);
			return [];
		}
	};

	return useQuery<T[]>({
		queryKey: 'test',
		queryFn: query,
	});
};
