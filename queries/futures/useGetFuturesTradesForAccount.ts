import { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { futuresAccountTypeState } from 'store/futures';
import logError from 'utils/logError';

import { FuturesAccountType, getFuturesTrades } from './subgraph';
import { FuturesTrade } from './types';
import { getFuturesEndpoint, mapTrades } from './utils';

const useGetFuturesTradesForAccount = (
	currencyKey: string | undefined,
	account?: string | null,
	options?: UseQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { network, isWalletConnected } = Connector.useContainer();
	const isL2 = useIsL2();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.TradesAccount(
			network?.id as NetworkId,
			currencyKey || null,
			account || null,
			selectedAccountType
		),
		async () => {
			if (!currencyKey || !account || !isL2) return null;

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
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isWalletConnected || (isL2 && !!account), ...options }
	);
};

export default useGetFuturesTradesForAccount;
