import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import useIsL2 from 'hooks/useIsL2';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import logError from 'utils/logError';

import { DAY_PERIOD, FUTURES_ENDPOINT_OP_MAINNET } from './constants';
import { getFuturesOneMinStats } from './subgraph';
import { FuturesDailyTradeStats, FuturesOneMinuteStat } from './types';
import { getFuturesEndpoint, calculateDailyTradeStats } from './utils';

const useGetFuturesDailyTradeStats = (options?: UseQueryOptions<FuturesDailyTradeStats | null>) => {
	const { chain: network } = useNetwork();
	const isL2 = useIsL2();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const futuresEndpoint = homepage
		? FUTURES_ENDPOINT_OP_MAINNET
		: getFuturesEndpoint(network?.id as NetworkId);

	const queryTrades = async (
		skip: number,
		existing: FuturesOneMinuteStat[]
	): Promise<FuturesOneMinuteStat[]> => {
		try {
			const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
			const response = await getFuturesOneMinStats(
				futuresEndpoint,
				{
					first: 999999,
					where: {
						timestamp_gte: `${minTimestamp}`,
					},
				},
				{
					trades: true,
					volume: true,
				}
			);

			return response;
		} catch (e) {
			logError(e);
			return [];
		}
	};

	return useQuery<FuturesDailyTradeStats | null>(
		QUERY_KEYS.Futures.DayTradeStats(network?.id as NetworkId, null),
		async () => {
			const trades = await queryTrades(0, []);

			return calculateDailyTradeStats(trades);
		},
		{ enabled: homepage || isL2, ...options }
	);
};

export default useGetFuturesDailyTradeStats;
