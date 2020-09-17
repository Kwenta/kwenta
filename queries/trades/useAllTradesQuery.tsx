import { useQuery, BaseQueryOptions } from 'react-query';
import snxData from 'synthetix-data';

import { HistoricalTrades } from './types';
import QUERY_KEYS from 'constants/queryKeys';

export const useAllTradesQuery = (
	maxBlock = Number.MAX_SAFE_INTEGER,
	max = 100,
	options: BaseQueryOptions
) =>
	useQuery<HistoricalTrades, any>(
		QUERY_KEYS.Trades.AllTrades,
		() =>
			snxData.exchanges.since({
				maxBlock: maxBlock,
				max: max,
			}),
		options
	);
