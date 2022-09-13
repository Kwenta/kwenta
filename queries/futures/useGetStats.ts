import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';

import { FUTURES_ENDPOINT_OP_MAINNET } from './constants';
import { FuturesStat } from './types';
import { getFuturesEndpoint } from './utils';

const PAGE_SIZE = 500;
const MAX_QUERY_LIMIT = 5000;

const useGetStats = (homepage?: boolean, options?: UseQueryOptions<any>) => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const futuresEndpoint = homepage
		? FUTURES_ENDPOINT_OP_MAINNET
		: getFuturesEndpoint(network?.id as NetworkId);

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
			if (response.futuresStats?.length === PAGE_SIZE && skip + PAGE_SIZE < MAX_QUERY_LIMIT) {
				return query(combined, skip + PAGE_SIZE);
			}
			return combined;
		}
		return [];
	};

	return useQuery({
		queryKey: QUERY_KEYS.Futures.Stats(network?.id as NetworkId),
		queryFn: () => query([], 0),
		enabled: homepage || isL2,
		...options,
	});
};

export default useGetStats;
