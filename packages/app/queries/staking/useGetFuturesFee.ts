import {
	AGGREGATE_ASSET_KEY,
	FUTURES_ENDPOINT_OP_MAINNET,
	SECONDS_PER_DAY,
} from '@kwenta/sdk/constants';
import { getFuturesAggregateStats } from '@kwenta/sdk/utils';
import { useQuery, UseQueryOptions } from 'react-query';

import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import useIsL2 from 'hooks/useIsL2';

const useGetFuturesFee = (
	start: number,
	end: number,
	options?: UseQueryOptions<Number | null> & { forceAccount: boolean }
) => {
	const isL2 = useIsL2();

	return useQuery<any>(
		QUERY_KEYS.Staking.TotalFuturesFee(start, end),
		async () => {
			const response = await getFuturesAggregateStats(
				FUTURES_ENDPOINT_OP_MAINNET,
				{
					first: DEFAULT_NUMBER_OF_FUTURES_FEE,
					where: {
						asset: AGGREGATE_ASSET_KEY,
						period: SECONDS_PER_DAY,
						timestamp_gte: start,
						timestamp_lt: end,
					},
					orderDirection: 'desc',
					orderBy: 'timestamp',
				},
				{
					timestamp: true,
					feesKwenta: true,
				}
			);
			return response;
		},
		{ enabled: isL2, ...options }
	);
};

export default useGetFuturesFee;
