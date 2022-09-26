import { useQuery } from 'react-query';
import { chainId } from 'wagmi';

import logError from 'utils/logError';

import { getFuturesHourlyStats } from './subgraph';
import { getFuturesEndpoint } from './utils';

interface T {
	date: string;
	volumes: number;
}

export const useGetFuturesVolumesStats = () => {
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
					asset: true,
					// id: true,
					timestamp: true,
					// trades: true,
					volume: true,
				}
			);

			const result: T[] = [];

			const map = new Map();

			response.forEach((res) => {
				const date = new Date(Number(res.timestamp) * 1000).toISOString().split('T')[0];
				const volume = res.volume.div(1e18).toNumber();

				if (!map.has(date)) {
					map.set(date, volume);
				} else {
					map.set(date, map.get(date) + volume);
				}
			});

			map.forEach((volumes, date) => {
				result.push({
					date,
					volumes,
				});
			});

			return result;
		} catch (e) {
			logError(e);
			return [];
		}
	};

	return useQuery<T[]>({
		queryKey: 'sfaoirw3',
		queryFn: query,
	});
};
