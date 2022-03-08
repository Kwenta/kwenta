import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import request, { gql } from 'graphql-request';
import { PositionHistory } from './types';
import { mapTradeHistory } from './utils';

const useGetFuturesPositionForAccount = (options?: UseQueryOptions<any>) => {
	const walletAddress = useRecoilValue(walletAddressState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AccountPositions(walletAddress),
		async () => {
			try {
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
							query userAllPositions($account: String!) {
								futuresPositions (
									where: {
										account: $account
									}
								) {
									id
									lastTxHash
									timestamp
									account
									market
									asset
									margin
									size
									isOpen
									isLiquidated
									entryPrice
									exitPrice
								}
							}
						`,
					{ account: walletAddress }
				);
				return response?.futuresPositions ? mapTradeHistory(response.futuresPositions, true) : [];
			}
			catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress,
			...options
		}
	);
};

export default useGetFuturesPositionForAccount;
