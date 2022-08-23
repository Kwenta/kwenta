import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { isL2State, networkState } from 'store/wallet';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { mapTradeHistory, getFuturesEndpoint } from './utils';

const useGetFuturesAccountPositionHistory = (
	account: string,
	options?: UseQueryOptions<any | null>
) => {
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network?.id);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AllPositionHistory(network.id, account || ''),
		async () => {
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						${FUTURES_POSITION_FRAGMENT}
						query allPositionHistory($account: String!) {
							futuresPositions(
								where: { account: $account }
								orderBy: timestamp
								orderDirection: desc
							) {
								...FuturesPositionFragment
							}
						}
					`,
					{ account: account }
				);

				return response ? mapTradeHistory(response.futuresPositions, false) : [];
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isL2, ...options }
	);
};

export default useGetFuturesAccountPositionHistory;
