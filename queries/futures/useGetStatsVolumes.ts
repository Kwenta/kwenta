import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import { chainId } from 'wagmi';

import { minTimestampState } from 'store/stats';
import { weiFromWei } from 'utils/formatters/number';
import logError from 'utils/logError';

import { getFuturesHourlyStats } from './subgraph';
import { getFuturesEndpoint } from './utils';

type VolumeStatMap = Record<
	string,
	{
		trades: number;
		volume: number;
	}
>;

type VolumeStat = {
	date: string;
	trades: number;
	volume: number;
	cumulativeTrades?: number;
};

export const useGetStatsVolumes = () => {
	const futuresEndpoint = getFuturesEndpoint(chainId.optimism);
	const minTimestamp = useRecoilValue(minTimestampState);

	const query = async () => {
		try {
			const response = await getFuturesHourlyStats(
				futuresEndpoint,
				{
					first: 999999,
					orderBy: 'timestamp',
					orderDirection: 'asc',
					where: {
						timestamp_gt: minTimestamp,
					},
				},
				{
					asset: true,
					timestamp: true,
					trades: true,
					volume: true,
				}
			);

			// aggregate markets into a single object
			const summary = response.reduce((acc: VolumeStatMap, res) => {
				const timestamp = res.timestamp.mul(1000).toNumber();
				const date = new Date(timestamp).toISOString().split('T')[0];
				const volume = weiFromWei(res.volume ?? 0).toNumber();
				const trades = res.trades.toNumber();

				acc[date] = {
					volume: acc[date]?.volume ? acc[date].volume + volume : volume,
					trades: acc[date]?.trades ? acc[date].trades + trades : trades,
				};
				return acc;
			}, {});

			// convert the object into an array and sort it
			const result: VolumeStat[] = Object.entries(summary)
				.map(([date, { trades, volume }]) => ({
					date,
					trades,
					volume,
				}))
				.sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1));

			// add cumulative trades and return
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

	return useQuery<VolumeStat[]>({
		queryKey: ['Stats', 'Volumes', minTimestamp],
		queryFn: query,
	});
};
