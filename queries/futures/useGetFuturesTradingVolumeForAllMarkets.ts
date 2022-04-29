import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { DAY_PERIOD } from './constants';
import { calculateTradeVolumeForAll, getFuturesEndpoint } from './utils';
import { FuturesVolumes } from './types';
import { getFuturesTrades } from './subgraph';

const useGetFuturesTradingVolumeForAllMarkets = (
	options?: UseQueryOptions<FuturesVolumes | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<FuturesVolumes | null>(
		QUERY_KEYS.Futures.TradingVolumeForAll(network.id),
		async () => {
			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: 999999,
						where: {
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
				return response ? calculateTradeVolumeForAll(response) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesTradingVolumeForAllMarkets;
