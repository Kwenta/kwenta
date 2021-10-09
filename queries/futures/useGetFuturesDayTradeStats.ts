import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateTimestampForPeriod } from 'queries/rates/utils';
import { DAY_PERIOD } from './constants';
import { calculateTradeVolume } from './utils';
import { FuturesDayTradeStats, FuturesTrade } from './types';

const PAGE_SIZE = 100;

const useGetFuturesDayTradeStats = (options?: UseQueryOptions<FuturesDayTradeStats | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);

	const queryTrades = async (skip: number, existing: FuturesTrade[]): Promise<FuturesTrade[]> => {
		try {
			const minTimestamp = calculateTimestampForPeriod(DAY_PERIOD);
			const response = await request(
				FUTURES_ENDPOINT,
				gql`
					query tradingVolume($minTimestamp: BigInt!, $skip: Int!) {
						futuresTrades(
							skip: $skip
							where: { timestamp_gte: $minTimestamp }
							orderBy: timestamp
							orderDirection: desc
						) {
							size
						}
					}
				`,
				{ minTimestamp, skip }
			);
			if (response) {
				const combined = [...existing, ...response.futuresTrades];
				if (response.futuresTrades?.length === PAGE_SIZE) {
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

	let skip = 0;

	return useQuery<FuturesDayTradeStats | null>(
		QUERY_KEYS.Futures.DayTradeStats,
		async () => {
			const trades = await queryTrades(skip, []);

			return {
				volume: calculateTradeVolume(trades),
				totalTrades: trades.length,
			};
		},
		{ enabled: isAppReady && isL2 && !!walletAddress, ...options }
	);
};

export default useGetFuturesDayTradeStats;
