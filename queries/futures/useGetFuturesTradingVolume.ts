import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';
import { calculateTimestampForPeriod } from 'utils/formatters/date';

import { DAY_PERIOD } from './constants';
import { getFuturesTrades } from './subgraph';
import { calculateTradeVolume, getFuturesEndpoint } from './utils';

const useGetFuturesTradingVolume = (
	currencyKey: string | null,
	options?: UseQueryOptions<Wei | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<Wei | null>(
		QUERY_KEYS.Futures.TradingVolume(network.id, currencyKey || null),
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
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey, ...options }
	);
};

export default useGetFuturesTradingVolume;
