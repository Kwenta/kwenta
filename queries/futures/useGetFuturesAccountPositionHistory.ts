import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { mapTradeHistory, getFuturesEndpoint } from './utils';

const useGetFuturesAccountPositionHistory = (
	account: string,
	options?: UseQueryOptions<any | null>
) => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AllPositionHistory(network?.id as NetworkId, account || ''),
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
