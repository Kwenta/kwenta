import QUERY_KEYS from 'constants/queryKeys';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import { getFuturesMarginTransfers } from './subgraph';
import { MarginTransfer } from './types';
import { getFuturesEndpoint, mapMarginTransfers } from './utils';

const useGetFuturesMarginTransfers = (
	currencyKey: string | null,
	options?: UseQueryOptions<number | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);
	console.log(currencyKey, ethersUtils.formatBytes32String(currencyKey));

	return useQuery<MarginTransfer[] | null>(
		QUERY_KEYS.Futures.MarginTransfers(network.id, currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const response = await getFuturesMarginTransfers(
					futuresEndpoint,
					{
						first: 999999,
						// where: {
						// 	market: `${ethersUtils.formatBytes32String(currencyKey)}`,
						// },
					},
					{
						size: true,
						id: true,
						timestamp: true,
						account: true,
						market: true,
					}
				);

				return response ? mapMarginTransfers(response) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!currencyKey,
			...options,
		}
	);
};

export default useGetFuturesMarginTransfers;
