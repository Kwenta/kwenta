import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import useIsL2 from 'hooks/useIsL2';
import { futuresVolumesState } from 'store/futures';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import logError from 'utils/logError';

import { DAY_PERIOD, FUTURES_ENDPOINT_OP_MAINNET } from './constants';
import { getFuturesHourlyStats } from './subgraph';
import { FuturesVolumes } from './types';
import { calculateTradeVolumeForAll, getFuturesEndpoint } from './utils';

const useGetFuturesTradingVolumeForAllMarkets = (
	options?: UseQueryOptions<FuturesVolumes | null>
) => {
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const { chain: activeChain } = useNetwork();
	const isL2 = useIsL2();
	const network = homepage || !isL2 ? chain.optimism : activeChain;
	const futuresEndpoint = homepage
		? FUTURES_ENDPOINT_OP_MAINNET
		: getFuturesEndpoint(network?.id as NetworkId);
	const setFuturesVolumes = useSetRecoilState(futuresVolumesState);

	return useQuery<FuturesVolumes | null>(
		QUERY_KEYS.Futures.TradingVolumeForAll(network?.id as NetworkId),
		async () => {
			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await getFuturesHourlyStats(
					futuresEndpoint,
					{
						first: 999999,
						where: {
							timestamp_gte: `${minTimestamp}`,
						},
					},
					{
						id: true,
						asset: true,
						volume: true,
						trades: true,
						timestamp: true,
					}
				);
				const futuresVolumes = response ? calculateTradeVolumeForAll(response) : {};
				setFuturesVolumes(futuresVolumes);
				return futuresVolumes;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			refetchInterval: 120000,
			...options,
		}
	);
};

export default useGetFuturesTradingVolumeForAllMarkets;
