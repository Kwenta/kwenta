import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { ETH_UNIT } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { futuresAccountState, marketInfoState } from 'store/futures';
import { isL2State, networkState } from 'store/wallet';
import logError from 'utils/logError';

import { getFuturesEndpoint } from './utils';

const useGetFuturesOpenOrders = (options?: UseQueryOptions<any>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const marketInfo = useRecoilValue(marketInfoState);

	return useQuery<any>(
		QUERY_KEYS.Futures.Orders(network.id, selectedFuturesAddress),
		async () => {
			try {
				const marketAddress = marketInfo?.market;
				const response = await request(
					futuresEndpoint,
					gql`
						query Orders($account: String!, $market: String!) {
							futuresOrders(where: { account: $account, market: $market }) {
								id
								account
								size
								market
								asset
								targetRoundId
								timestamp
								orderType
								status
							}
						}
					`,
					{ account: selectedFuturesAddress, market: marketAddress }
				);

				const orders = response
					? response.futuresOrders.map((o: any) => ({
							...o,
							asset: ethersUtils.parseBytes32String(o.asset),
							targetRoundId: new Wei(o.targetRoundId, 0),
							size: new Wei(o.size).div(ETH_UNIT),
					  }))
					: [];
				return orders;
			} catch (e) {
				logError(e);
				return [];
			}
		},
		{
			enabled: isAppReady && isL2 && !!marketInfo?.market && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesOpenOrders;
