import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateCumulativeTrades } from './utils';
import { FuturesTotalTrades } from './types';

const PAGE_SIZE = 500;

const useGetFuturesCumulativeTrades = (options?: UseQueryOptions<number | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	const fetchStats = async (
		skip: number,
		existing: FuturesTotalTrades[]
	): Promise<FuturesTotalTrades[]> => {
		const response = await request(
			FUTURES_ENDPOINT,
			gql`
				query FuturesTotalTrades($skip: Int) {
					futuresStats(first: ${PAGE_SIZE}, skip: $skip) {
						totalTrades
					}
				}
			`,
			{ skip }
		);
		if (response) {
			const combined = [...existing, ...response.futuresStats];
			if (response.futuresStats?.length === PAGE_SIZE) {
				return fetchStats(skip + PAGE_SIZE, combined);
			}
			return combined;
		}
		return [];
	};

	return useQuery<number | null>(
		QUERY_KEYS.Futures.TotalTrades,
		async () => {
			try {
				const response = await fetchStats(0, []);

				return response ? calculateCumulativeTrades(response) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesCumulativeTrades;
