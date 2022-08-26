import { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { useAccount, useNetwork } from 'wagmi';

import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import useIsL2 from 'hooks/useIsL2';
import { futuresAccountState } from 'store/futures';
import logError from 'utils/logError';

import { FuturesAccountType, getFuturesTrades } from './subgraph';
import { FuturesTrade } from './types';
import { getFuturesEndpoint, mapTrades } from './utils';

const useGetFuturesTradesForAccount = (
	currencyKey: string | undefined,
	account?: string | null,
	options?: UseQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const { chain: network } = useNetwork();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const { isConnected: isWalletConnected } = useAccount();
	const isL2 = useIsL2();
	const { selectedAccountType } = useRecoilValue(futuresAccountState);

	return useQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.TradesAccount(
			network?.id as NetworkId,
			currencyKey || null,
			account || null,
			selectedAccountType
		),
		async () => {
			if (!currencyKey || !account) return null;

			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: DEFAULT_NUMBER_OF_TRADES,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
							account: account,
							accountType: selectedAccountType as FuturesAccountType,
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
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isWalletConnected || (isL2 && !!account), ...options }
	);
};

export default useGetFuturesTradesForAccount;
