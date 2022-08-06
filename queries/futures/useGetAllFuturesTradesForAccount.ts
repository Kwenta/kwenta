import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';

import { getFuturesTrades } from './subgraph';
import { FuturesTrade } from './types';
import { getFuturesEndpoint, mapTrades } from './utils';

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
					abstractAccount: true,
					accountType: true,
					margin: true,
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
		{ enabled: isL2 && isAppReady && isWalletConnected && !!account, ...options }
	);
};

export default useGetAllFuturesTradesForAccount;
