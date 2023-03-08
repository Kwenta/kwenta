import { useQuery, UseQueryOptions } from 'react-query';

import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesTrades } from 'queries/futures/subgraph';
import { FUTURES_ENDPOINT_OP_MAINNET } from 'sdk/constants/futures';

const useGetFuturesFeeForAccount = (
	account: string,
	start: number,
	end: number,
	options?: UseQueryOptions<Number | null> & { forceAccount: boolean }
) => {
	return useQuery<any>(
		QUERY_KEYS.Staking.FuturesFee(account || null, start, end),
		async () => {
			if (!account) return null;

			const response = await getFuturesTrades(
				FUTURES_ENDPOINT_OP_MAINNET,
				{
					first: DEFAULT_NUMBER_OF_FUTURES_FEE,
					where: {
						account: account,
						timestamp_gt: start,
						timestamp_lt: end,
						accountType: 'isolated_margin',
					},
					orderDirection: 'desc',
					orderBy: 'timestamp',
				},
				{
					timestamp: true,
					account: true,
					abstractAccount: true,
					accountType: true,
					feesPaid: true,
				}
			);
			return response;
		},
		{ enabled: !!account, ...options }
	);
};

export default useGetFuturesFeeForAccount;
