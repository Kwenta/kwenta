import { useQuery, UseQueryOptions } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { HistoricalTrades } from './types';

export const useAllTradesQuery = (
	maxBlock = Number.MAX_SAFE_INTEGER,
	max = 100,
	options?: UseQueryOptions<HistoricalTrades>
) =>
	useQuery<HistoricalTrades>(
		QUERY_KEYS.Trades.AllTrades,
		() =>
			snxData.exchanges.since({
				maxBlock,
				max,
			}),
		options
	);

export default useAllTradesQuery;
