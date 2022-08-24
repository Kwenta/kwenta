import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useNetwork, chain } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { mapTradeHistory, getFuturesEndpoint } from './utils';

const useGetFuturesAccountPositionHistory = (
	account: string,
	options?: UseQueryOptions<any | null>
) => {
	const { chain: network } = useNetwork();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const isL2 =
		network !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(network?.id)
			: true;
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
