import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';

import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';

import { getFuturesTrades } from './subgraph';
import { FuturesTrade } from './types';
import { getFuturesEndpoint, mapTrades } from './utils';

const useGetAllFuturesTradesForAccount = (
	account?: string | null,
	options?: UseQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const { network, isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();

	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.AllTradesAccount(network?.id as NetworkId, account || null),
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
					marketKey: true,
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
		{ enabled: isL2 && isWalletConnected && !!account, ...options }
	);
};

export default useGetAllFuturesTradesForAccount;
