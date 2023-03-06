import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { useQuery } from 'react-query';

import { chain } from 'containers/Connector/config';
import { PERIOD_IN_SECONDS } from 'sdk/constants/period';
import { getFuturesEndpoint } from 'sdk/utils/futures';
import { useAppSelector } from 'state/hooks';
import { selectMinTimestamp } from 'state/stats/selectors';
import { weiFromWei } from 'utils/formatters/number';
import logError from 'utils/logError';

import { AGGREGATE_ASSET_KEY } from './constants';
import { getFuturesAggregateStats } from './subgraph';

type VolumeStat = {
	date: string;
	trades: number;
	volume: number;
	cumulativeTrades?: number;
};

export const useGetStatsVolumes = () => {
	const futuresEndpoint = getFuturesEndpoint(chain.optimism.id as NetworkId);
	const minTimestamp = useAppSelector(selectMinTimestamp);

	const query = async () => {
		try {
			const response = await getFuturesAggregateStats(
				futuresEndpoint,
				{
					first: 999999,
					orderBy: 'timestamp',
					orderDirection: 'asc',
					where: {
						period: `${PERIOD_IN_SECONDS.ONE_DAY}`,
						timestamp_gt: minTimestamp,
						asset: AGGREGATE_ASSET_KEY,
					},
				},
				{
					asset: true,
					timestamp: true,
					trades: true,
					volume: true,
				}
			);

			let cumulativeTrades = wei(0);
			const result: VolumeStat[] = response.map(({ timestamp, trades, volume }) => {
				cumulativeTrades = cumulativeTrades.add(trades);
				const thisTimestamp = timestamp.mul(1000).toNumber();
				const date = new Date(thisTimestamp).toISOString().split('T')[0];
				return {
					date,
					trades: trades.toNumber(),
					volume: weiFromWei(volume ?? 0).toNumber(),
					cumulativeTrades: cumulativeTrades.toNumber(),
				};
			});
			return result;
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
