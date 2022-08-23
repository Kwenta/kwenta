import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import { futuresAccountState } from 'store/futures';
import { networkState } from 'store/wallet';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';

const useGetFuturesPositionForAccount = (options?: UseQueryOptions<any>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const { chain: activeChain } = useNetwork();
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(activeChain?.id)
			: false;
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network?.id);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AccountPositions(selectedFuturesAddress, network.id),
		async () => {
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						${FUTURES_POSITION_FRAGMENT}
						query userAllPositions($account: String!) {
							futuresPositions(where: { account: $account }) {
								...FuturesPositionFragment
							}
						}
					`,
					{ account: selectedFuturesAddress }
				);
				return response?.futuresPositions ? mapTradeHistory(response.futuresPositions, true) : [];
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: isL2 && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesPositionForAccount;
