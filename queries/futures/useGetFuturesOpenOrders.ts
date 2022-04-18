import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import request, { gql } from 'graphql-request';
import { getFuturesEndpoint } from './utils';

const useGetFuturesOpenOrders = (currencyKey: string | null, options?: UseQueryOptions<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<any[]>(
		QUERY_KEYS.Futures.OpenOrders(network.id),
		async () => {
			if (!currencyKey) return null;
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query OpenOrders {
							nextPriceOrders(where: { account: $account }) {
								id
								account
								size
								market
								asset
								timestamp
							}
						}
					`,
					{ account: walletAddress }
				);

				return response ? response.nextPriceOrders : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey, ...options }
	);
};

export default useGetFuturesOpenOrders;
