import { useQuery, QueryConfig } from 'react-query';
import synthetixData from '@synthetixio/data';
import { useRecoilValue } from 'recoil';
import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { HistoricalTrades } from './types';
import { networkState } from 'store/wallet';

export const useWalletTradesQuery = (
	max: number = 100,
	options?: QueryConfig<HistoricalTrades | null>
) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);

	return useQuery<HistoricalTrades | null>(
		QUERY_KEYS.Trades.WalletTrades(walletAddress || '', network?.id!),
		async () => {
			const walletTrades = await synthetixData({ networkId: network?.id! }).synthExchanges({
				fromAddress: walletAddress ?? undefined,
				max,
			});

			//TODO: move to parsing library
			const walletTradesWithHash = walletTrades?.map((trade) => ({
				...trade,
				hash: trade.id.split('-')[0],
			}));

			return walletTradesWithHash ?? null;
		},
		{
			enabled: isWalletConnected,
			...options,
		}
	);
};
