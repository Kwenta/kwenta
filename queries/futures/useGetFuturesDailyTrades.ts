import { NetworkId } from '@synthetixio/contracts-interface';
import { utils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { FuturesMarketAsset } from 'utils/futures';
import logError from 'utils/logError';

import { DAY_PERIOD } from './constants';
import { getFuturesTrades } from './subgraph';
import { getFuturesEndpoint } from './utils';

const useGetFuturesDailyTradeStatsForMarket = (
	marketAsset: FuturesMarketAsset | null,
	options?: UseQueryOptions<number | null>
) => {
	const { chain: network } = useNetwork();
	const isL2 =
		network !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(network?.id)
			: false;
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<number | null>(
		QUERY_KEYS.Futures.DayTradeStats(network?.id as NetworkId, marketAsset),
		async () => {
			if (!marketAsset) return null;

			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: 999999,
						where: {
							asset: `${utils.formatBytes32String(marketAsset)}`,
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
		{ enabled: isL2 && !!marketAsset, ...options }
	);
};

export default useGetFuturesDailyTradeStatsForMarket;
