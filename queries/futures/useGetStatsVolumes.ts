import { useQuery } from 'react-query';
import { chainId } from 'wagmi';

import { weiFromWei } from 'utils/formatters/number';
import logError from 'utils/logError';

import { getFuturesHourlyStats } from './subgraph';
import { getFuturesEndpoint } from './utils';

type StatsMap = Record<
	number,
	{
		trades: number;
		volume: number;
	}
>;

type StatsRecord = {
	date: string;
	trades: number;
	volume: number;
	cumulativeTrades?: number;
};

export const useGetStatsVolumes = () => {
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
					timestamp: true,
					trades: true,
					volume: true,
				}
			);

			const summary = response.reduce((acc: StatsMap, res) => {
				const timestamp = res.timestamp.mul(1000).toNumber();
				const volume = weiFromWei(res.volume ?? 0).toNumber();
				const trades = res.trades.toNumber();

				acc[timestamp] = {
					volume: acc[timestamp]?.volume ? acc[timestamp].volume + volume : volume,
					trades: acc[timestamp]?.trades ? acc[timestamp].trades + trades : trades,
				};
				return acc;
			}, {});

			const result: StatsRecord[] = Object.entries(summary)
				.map(([timestamp, { trades, volume }]) => ({
					date: new Date(Number(timestamp)).toISOString().split('T')[0],
					trades,
					volume,
				}))
				.sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));

			let cumulativeTrades = 0;
			return result.map((res) => {
				cumulativeTrades += res.trades;
				return {
					...res,
					cumulativeTrades: cumulativeTrades,
				};
			});
		} catch (e) {
			logError(e);
			return [];
		}
	};

	return useQuery<StatsRecord[]>({
		queryKey: 'sfaoirw3',
		queryFn: query,
	});
};
