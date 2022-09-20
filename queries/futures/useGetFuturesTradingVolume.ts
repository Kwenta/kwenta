import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import logError from 'utils/logError';

import { DAY_PERIOD } from './constants';
import { FuturesHourlyStatResult, getFuturesHourlyStats } from './subgraph';
import { calculateTradeVolume, getFuturesEndpoint } from './utils';

const useGetFuturesTradingVolume = (
	currencyKey: string | null,
	options?: UseQueryOptions<Wei | null>
) => {
	const { network } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<Wei | null>(
		QUERY_KEYS.Futures.TradingVolume(network?.id as NetworkId, currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await getFuturesHourlyStats(
					futuresEndpoint,
					{
						first: 999999,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
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
				return response ? calculateTradeVolume(response as FuturesHourlyStatResult[]) : null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: !!currencyKey, ...options }
	);
};

export default useGetFuturesTradingVolume;
