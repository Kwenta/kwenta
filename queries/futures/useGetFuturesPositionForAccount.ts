import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { futuresAccountTypeState } from 'store/futures';
import { futuresAccountState } from 'store/futures';
import logError from 'utils/logError';

import { FUTURES_POSITION_FRAGMENT } from './constants';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';

const useGetFuturesPositionForAccount = (options?: UseQueryOptions<any>) => {
	const { network, walletAddress } = Connector.useContainer();

	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AccountPositions(
			walletAddress,
			network.id as NetworkId,
			selectedAccountType
		),
		async () => {
			if (!walletAddress) return [];
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						${FUTURES_POSITION_FRAGMENT}
						query userAllPositions($account: String!, $accountType: String!) {
							futuresPositions(where: { account: $account, accountType: $accountType }) {
								...FuturesPositionFragment
							}
						}
					`,
					{ account: walletAddress, accountType: selectedAccountType }
				);
				return response?.futuresPositions ? mapTradeHistory(response.futuresPositions, true) : [];
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesPositionForAccount;
