import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import logError from 'utils/logError';

import { DAY_PERIOD, FUTURES_ENDPOINT_MAINNET } from './constants';
import { getFuturesTrades } from './subgraph';
import { FuturesVolumes } from './types';
import { calculateTradeVolumeForAll, getFuturesEndpoint } from './utils';

const useGetFuturesTradingVolumeForAllMarkets = (
	options?: UseQueryOptions<FuturesVolumes | null>
) => {
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const { chain: activeChain } = useNetwork();
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(activeChain?.id)
			: false;
	const network = homepage || !isL2 ? chain.optimism : activeChain;

	const futuresEndpoint = homepage
		? FUTURES_ENDPOINT_MAINNET
		: getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<FuturesVolumes | null>(
		QUERY_KEYS.Futures.TradingVolumeForAll(network?.id as NetworkId),
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
						abstractAccount: true,
						accountType: true,
						margin: true,
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
				logError(e);
				return null;
			}
		},
		{ enabled: homepage || isL2, ...options }
	);
};

export default useGetFuturesTradingVolumeForAllMarkets;
