import { useQuery, UseQueryOptions } from 'react-query';
import snxData from 'synthetix-data';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { HistoricalTrades } from './types';

export const useWalletTradesQuery = (
	max: number = 100,
	options?: UseQueryOptions<HistoricalTrades>
) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<HistoricalTrades>(
		QUERY_KEYS.Trades.WalletTrades(walletAddress || ''),
		() =>
			snxData.exchanges.since({
				fromAddress: walletAddress,
				maxBlock: Number.MAX_SAFE_INTEGER,
				max,
			}),
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};
