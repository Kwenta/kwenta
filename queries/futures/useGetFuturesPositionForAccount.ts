import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import request, { gql } from 'graphql-request';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapTradeHistory } from './utils';
import { FUTURES_POSITION_FRAGMENT } from './constants';
import { futuresAccountState } from 'store/futures';

const useGetFuturesPositionForAccount = (options?: UseQueryOptions<any>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

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
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesPositionForAccount;
