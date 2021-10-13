import { useQueries, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';
import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import request, { gql } from 'graphql-request';

const useGetStats = (accounts: string[], options?: UseQueryOptions<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQueries(
		accounts.map((account) => {
			return {
				queryKey: QUERY_KEYS.Futures.Stats(account),
				queryFn: async () => {
					const response = await request(
						FUTURES_ENDPOINT,
						gql`
							query userStats($account: String!) {
								futuresStats(where: { account: $account }) {
									account
									pnl
									liquidations
									totalTrades
								}
							}
						`,
						{ account: account }
					);
					return {
						[account]: {
							pnl: new Wei(response?.futuresStats[0]?.pnl ?? 0, 18, true),
							liquidations: new Wei(response?.futuresStats[0]?.liquidations ?? 0),
							totalTrades: new Wei(response?.futuresStats[0]?.totalTrades ?? 0),
						},
					};
				},
				enabled: isAppReady && isL2 && !!accounts.length,
				...options,
			};
		})
	);
};

export default useGetStats;
