import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import useIsL2 from 'hooks/useIsL2';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import logError from 'utils/logError';

import { DAY_PERIOD } from './constants';
import { getFuturesTrades } from './subgraph';
import { calculateTradeVolume, getFuturesEndpoint } from './utils';

const useGetFuturesTradingVolume = (
	currencyKey: string | null,
	options?: UseQueryOptions<Wei | null>
) => {
	const { chain: network } = useNetwork();
	const isL2 = useIsL2(network?.id as NetworkId);
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<Wei | null>(
		QUERY_KEYS.Futures.TradingVolume(network?.id as NetworkId, currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: 999999,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
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
				return response ? calculateTradeVolume(response) : null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: isL2 && !!currencyKey, ...options }
	);
};

export default useGetFuturesTradingVolume;
