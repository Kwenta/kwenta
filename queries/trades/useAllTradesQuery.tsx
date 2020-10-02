import { useQuery, QueryConfig } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { HistoricalTrades } from './types';

type PromiseResult = HistoricalTrades;

export const useAllTradesQuery = (
	maxBlock = Number.MAX_SAFE_INTEGER,
	max = 100,
	options?: QueryConfig<PromiseResult>
) =>
	useQuery<PromiseResult>(
		QUERY_KEYS.Trades.AllTrades,
		() =>
			snxData.exchanges.since({
				maxBlock,
				max,
			}),
		options
	);

export default useAllTradesQuery;
