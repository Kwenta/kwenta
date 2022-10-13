import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { openOrdersState, futuresMarketsState, selectedFuturesAddressState } from 'store/futures';
import logError from 'utils/logError';

import { FuturesOrder } from './types';
import { getFuturesEndpoint, mapFuturesOrders } from './utils';

const useGetFuturesOpenOrders = (options?: UseQueryOptions<any>) => {
	const selectedFuturesAddress = useRecoilValue(selectedFuturesAddressState);
	const { network } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const setOpenOrders = useSetRecoilState(openOrdersState);

	return useQuery<FuturesOrder[]>(
		QUERY_KEYS.Futures.OpenOrders(network?.id as NetworkId, selectedFuturesAddress),
		async () => {
			if (!selectedFuturesAddress) {
				setOpenOrders([]);
				return [];
			}
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query OpenOrders($account: String!) {
							futuresOrders(where: { abstractAccount: $account, status: Pending }) {
								id
								account
								size
								market
								asset
								targetRoundId
								marginDelta
								targetPrice
								timestamp
								orderType
							}
						}
					`,
					{ account: selectedFuturesAddress }
				);

				const openOrders: FuturesOrder[] = response
					? response.futuresOrders.map((o: any) => {
							const marketInfo = futuresMarkets.find((m) => m.asset === o.asset);
							return mapFuturesOrders(o, marketInfo);
					  })
					: [];
				setOpenOrders(openOrders);
				return openOrders;
			} catch (e) {
				logError(e);
				return [];
			}
		},
		{
			enabled: futuresMarkets.length > 0 && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesOpenOrders;
