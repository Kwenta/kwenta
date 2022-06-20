import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesEndpoint, mapTrades } from './utils';
import { FuturesTrade } from './types';
import { getFuturesTrades } from './subgraph';
import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';

const useGetAllFuturesTradesForAccount = (
	account?: string | null,
	options?: UseQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.AllTradesAccount(network.id, account || null),
		async () => {
			if (!account) return null;

			const response = await getFuturesTrades(
				futuresEndpoint,
				{
					first: DEFAULT_NUMBER_OF_TRADES,
					where: {
						account: account,
					},
					orderDirection: 'desc',
					orderBy: 'timestamp',
				},
				{
					id: true,
					timestamp: true,
					account: true,
					size: true,
					asset: true,
					price: true,
					positionId: true,
					positionSize: true,
					positionClosed: true,
					pnl: true,
					feesPaid: true,
					orderType: true,
				}
			);
			return response ? mapTrades(response) : null;
		},
		{ enabled: isWalletConnected ? isL2 && isAppReady && !!account : isAppReady, ...options }
	);
};

export default useGetAllFuturesTradesForAccount;
