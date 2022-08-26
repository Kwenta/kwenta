import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { useNetwork } from 'wagmi';

import { ETH_UNIT } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import useIsL2 from 'hooks/useIsL2';
import { futuresAccountState, openOrdersState, marketInfoState } from 'store/futures';
import logError from 'utils/logError';

import { getFuturesEndpoint } from './utils';

const useGetFuturesOpenOrders = (options?: UseQueryOptions<any>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const { chain: network } = useNetwork();
	const isL2 = useIsL2(network?.id as NetworkId);
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const marketInfo = useRecoilValue(marketInfoState);
	const setOpenOrders = useSetRecoilState(openOrdersState);

	return useQuery<any[]>(
		QUERY_KEYS.Futures.OpenOrders(network?.id as NetworkId, selectedFuturesAddress),
		async () => {
			try {
				const marketAddress = marketInfo?.market;
				const response = await request(
					futuresEndpoint,
					gql`
						query OpenOrders($account: String!, $market: String!) {
							futuresOrders(where: { account: $account, market: $market, status: Pending }) {
								id
								account
								size
								market
								asset
								targetRoundId
								timestamp
								orderType
							}
						}
					`,
					{ account: selectedFuturesAddress, market: marketAddress }
				);

				const openOrders = response
					? response.futuresOrders.map((o: any) => ({
							...o,
							asset: ethersUtils.parseBytes32String(o.asset),
							targetRoundId: new Wei(o.targetRoundId, 0),
							size: new Wei(o.size).div(ETH_UNIT),
					  }))
					: [];

				setOpenOrders(openOrders);

				return openOrders;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: isL2 && !!marketInfo?.market && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesOpenOrders;
