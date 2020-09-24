import { useQuery, BaseQueryOptions } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { HistoricalTrades } from './types';

export const useWalletTradesQuery = ({
	walletAddress,
	max = 100,
	options,
}: {
	walletAddress: string;
	max?: number;
	options?: BaseQueryOptions;
}) =>
	useQuery<HistoricalTrades, any>(
		QUERY_KEYS.Trades.WalletTrades(walletAddress),
		() =>
			snxData.exchanges.since({
				fromAddress: walletAddress,
				maxBlock: Number.MAX_SAFE_INTEGER,
				max: max,
			}),
		options
	);
