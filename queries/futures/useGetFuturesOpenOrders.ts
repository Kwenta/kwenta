import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import request, { gql } from 'graphql-request';
import { getFuturesEndpoint } from './utils';
import Wei, { wei } from '@synthetixio/wei';

const useGetFuturesOpenOrders = (currencyKey: string | null, options?: UseQueryOptions<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<any[]>(
		QUERY_KEYS.Futures.OpenOrders(network.id),
		async () => {
			if (!currencyKey || !walletAddress) return [];

			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query OpenOrders($account: String!) {
							futuresOrders(where: { account: $account, status: Pending }) {
								id
								account
								size
								market
								asset
								timestamp
								orderType
							}
						}
					`,
					{ account: walletAddress }
				);

				return response
					? response.futuresOrders.map((o: any) => ({
							...o,
							asset: ethersUtils.parseBytes32String(o.asset),
							size: new Wei(o.size, 18, true),
					  }))
					: [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey, ...options }
	);
};

export default useGetFuturesOpenOrders;
