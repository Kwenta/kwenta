import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { getFuturesEndpoint, calculateDailyTradeStats } from './utils';
import { FuturesDailyTradeStats, FuturesOneMinuteStat } from './types';
import { DAY_PERIOD } from './constants';

const PAGE_SIZE = 500;

const useGetFuturesDailyTradeStats = (options?: UseQueryOptions<FuturesDailyTradeStats | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	const queryTrades = async (
		skip: number,
		existing: FuturesOneMinuteStat[]
	): Promise<FuturesOneMinuteStat[]> => {
		try {
			const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
			const response = await request(
				futuresEndpoint,
				gql`
					query FutureOneMinStats($skip: Int!) {
						futuresOneMinStats(
							skip: $skip
							first: ${PAGE_SIZE}
							where: { timestamp_gte: ${minTimestamp} }
						) {
							trades
							volume
						}
					}
				`,
				{ skip }
			);
			if (response) {
				const combined = [...existing, ...response.futuresOneMinStats];
				if (response.futuresOneMinStats?.length === PAGE_SIZE) {
					return queryTrades(skip + PAGE_SIZE, combined);
				}
				return combined;
			}
			return [];
		} catch (e) {
			console.log(e);
			return [];
		}
	};

	return useQuery<FuturesDailyTradeStats | null>(
		QUERY_KEYS.Futures.DayTradeStats(network.id, null),
		async () => {
			const trades = await queryTrades(0, []);

			return calculateDailyTradeStats(trades);
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesDailyTradeStats;
