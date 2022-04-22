import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { PositionHistory } from './types';

import { mapTradeHistory, getFuturesEndpoint } from './utils';

const useGetFuturesAccountPositionHistory = (
	account: string,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<PositionHistory[] | null>(
		QUERY_KEYS.Futures.AllPositionHistory(network.id, account || ''),
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
								account
								market
								lastTxHash
								openTimestamp
								closeTimestamp
								totalVolume
								trades
								timestamp
								isOpen
								isLiquidated
								entryPrice
								exitPrice
								size
								margin
								asset
								pnl
								feesPaid
								netFunding
							}
						}
					`,
					{ account: account }
				);

				return response ? mapTradeHistory(response.futuresPositions, false) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesAccountPositionHistory;
