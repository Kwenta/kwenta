import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { PositionHistory } from './types';

import { mapTradeHistory, getFuturesEndpoint } from './utils';

const useGetFuturesAllPositionHistory = (options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network)


	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AllPositionHistory(network.id, walletAddress || ''),
		async () => {
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query allPositionHistory($account: String!) {
							futuresPositions(
								where: { account: $account }
								orderBy: timestamp
								orderDirection: desc
							) {
								id
								lastTxHash
								timestamp
								isOpen
								isLiquidated
								entryPrice
								exitPrice
								size
								margin
								asset
							}
						}
					`,
					{ account: walletAddress }
				);

				return response ? mapTradeHistory(response.futuresPositions, false) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress, ...options }
	);
};

export default useGetFuturesAllPositionHistory;
