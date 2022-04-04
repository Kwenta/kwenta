import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import request, { gql } from 'graphql-request';
import { FuturesStat } from './types';
import { getFuturesEndpoint } from './utils';

const PAGE_SIZE = 500;

const useGetStats = (options?: UseQueryOptions<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	const query = async (existing: FuturesStat[], skip: number): Promise<FuturesStat[]> => {
		const response = await request(
			futuresEndpoint,
			gql`
				query userStats($skip: Int!) {
					futuresStats(skip: $skip, first: ${PAGE_SIZE}) {
						account
						pnlWithFeesPaid
						liquidations
						totalTrades
						totalVolume
					}
				}
			`,
			{ skip }
		);
		if (response) {
			const combined = [...existing, ...response.futuresStats];
			if (response.futuresStats?.length === PAGE_SIZE) {
				return query(combined, skip + PAGE_SIZE);
			}
			return combined;
		}
		return [];
	};

	return useQuery({
		queryKey: QUERY_KEYS.Futures.Stats,
		queryFn: () => query([], 0),
		enabled: isAppReady && isL2,
		...options,
	});
};

export default useGetStats;
