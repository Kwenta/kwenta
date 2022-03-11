import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { calculateDailyTradeStats } from './utils';
import { FuturesDailyTradeStats, FuturesOneMinuteStat } from './types';

const PAGE_SIZE = 500;

const useGetFuturesDailyTradeStats = (options?: UseQueryOptions<FuturesDailyTradeStats | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);

	const queryTrades = async (
		skip: number,
		existing: FuturesOneMinuteStat[]
	): Promise<FuturesOneMinuteStat[]> => {
		try {
			const minTimestamp = calculateTimestampForPeriod(24);
			const response = await request(
				FUTURES_ENDPOINT,
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
		QUERY_KEYS.Futures.DayTradeStats,
		async () => {
			const trades = await queryTrades(0, []);

			return calculateDailyTradeStats(trades);
		},
		{ enabled: isAppReady && isL2 && !!walletAddress, ...options }
	);
};

export default useGetFuturesDailyTradeStats;
