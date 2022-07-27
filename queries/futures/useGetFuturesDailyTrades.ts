import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { marketInfoState } from 'store/futures';
import { isL2State, networkState } from 'store/wallet';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import logError from 'utils/logError';

import { DAY_PERIOD } from './constants';
import { getFuturesTrades } from './subgraph';
import { getFuturesEndpoint } from './utils';

const useGetFuturesDailyTradeStatsForMarket = (options?: UseQueryOptions<number | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const marketInfo = useRecoilValue(marketInfoState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<number | null>(
		QUERY_KEYS.Futures.DayTradeStats(network.id, marketInfo?.assetHex),
		async () => {
			if (!marketInfo) return null;

			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: 999999,
						where: {
							asset: `${marketInfo.assetHex}`,
							timestamp_gte: `${minTimestamp}`,
						},
					},
					{
						size: true,
						price: true,
						id: true,
						timestamp: true,
						account: true,
						asset: true,
						positionSize: true,
						positionClosed: true,
					}
				);
				return response ? response.length : null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!marketInfo, ...options }
	);
};

export default useGetFuturesDailyTradeStatsForMarket;
