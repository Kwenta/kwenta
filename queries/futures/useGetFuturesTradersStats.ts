import { useQuery } from 'react-query';
import { chainId } from 'wagmi';

import logError from 'utils/logError';

import { getFuturesTrades } from './subgraph';
import { getFuturesEndpoint } from './utils';

interface T {
	date: string;
	uniqueTradersByPeriod: number;
	totalUniqueTraders: number;
}

export const useGetFuturesTradersStats = () => {
	const query = async () => {
		try {
			const futuresEndpoint = getFuturesEndpoint(chainId.optimism);
			const response = await getFuturesTrades(
				futuresEndpoint,
				{
					first: 99999,
					orderDirection: 'asc',
					orderBy: 'timestamp',
				},
				{
					timestamp: true,
					account: true,
				}
			);

			const result: T[] = [];

			const map = new Map();

			response.forEach((res) => {
				const date = new Date(Number(res.timestamp) * 1000).toISOString().split('T')[0];

				if (!map.has(date)) {
					map.set(date, [res.account]);
				} else {
					const temp = map.get(date);
					temp.push(res.account);
					map.set(date, temp);
				}
			});

			let sum = 0;

			map.forEach((accounts, date) => {
				const uniqueTradersByPeriod = [...new Set(accounts)].length;

				sum += result.length > 0 ? result[result.length - 1].uniqueTradersByPeriod : 0;

				result.push({
					date,
					uniqueTradersByPeriod,
					totalUniqueTraders: uniqueTradersByPeriod + sum,
				});
			});

			return result;
		} catch (e) {
			logError(e);
			return [];
		}
	};

	return useQuery<T[]>({
		queryKey: 'get-futures-traders-stats',
		queryFn: query,
	});
};
