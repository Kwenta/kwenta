import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { HistoricalTrades } from './types';

type PromiseResult = HistoricalTrades;

export const useWalletTradesQuery = ({
	walletAddress,
	max = 100,
	options,
}: {
	walletAddress: string;
	max?: number;
	options?: QueryConfig<PromiseResult>;
}) =>
	useQuery<PromiseResult>(
		QUERY_KEYS.Trades.WalletTrades(walletAddress),
		() =>
			snxData.exchanges.since({
				fromAddress: walletAddress,
				maxBlock: Number.MAX_SAFE_INTEGER,
				max,
			}),
		options
	);
