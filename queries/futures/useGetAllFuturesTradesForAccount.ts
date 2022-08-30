import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { useAccount, useNetwork } from 'wagmi';

import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import useIsL2 from 'hooks/useIsL2';

import { getFuturesTrades } from './subgraph';
import { FuturesTrade } from './types';
import { getFuturesEndpoint, mapTrades } from './utils';

const useGetAllFuturesTradesForAccount = (
	account?: string | null,
	options?: UseQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const { chain: network } = useNetwork();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const { isConnected: isWalletConnected } = useAccount();

	const isL2 = useIsL2();

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
