import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { DAY_PERIOD, FUTURES_ENDPOINT_MAINNET } from './constants';
import { calculateTradeVolumeForAll, getFuturesEndpoint } from './utils';
import { FuturesVolumes } from './types';
import { getFuturesTrades } from './subgraph';
import ROUTES from 'constants/routes';

const useGetFuturesTradingVolumeForAllMarkets = (
	options?: UseQueryOptions<FuturesVolumes | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const futuresEndpoint = homepage ? FUTURES_ENDPOINT_MAINNET : getFuturesEndpoint(network);

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
						positionId: true,
						positionSize: true,
						positionClosed: true,
						pnl: true,
						feesPaid: true,
						orderType: true,
					}
				);
				return response ? calculateTradeVolumeForAll(response) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: homepage ? isAppReady : isAppReady && isL2, ...options }
	);
};

export default useGetFuturesTradingVolumeForAllMarkets;
