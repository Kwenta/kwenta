import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ETH_UNIT } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { currentMarketState, openOrdersState } from 'store/futures';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { getDisplayAsset } from 'utils/futures';

import { getFuturesEndpoint } from './utils';

const useGetFuturesOpenOrders = (options?: UseQueryOptions<any>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const { synthetixjs } = Connector.useContainer();
	const currencyKey = useRecoilValue(currentMarketState);
	const [, setOpenOrders] = useRecoilState(openOrdersState);

	return useQuery<any[]>(
		QUERY_KEYS.Futures.OpenOrders(network.id, walletAddress),
		async () => {
			try {
				const { contracts } = synthetixjs!;
				const marketAddress = contracts[`FuturesMarket${getDisplayAsset(currencyKey)}`].address;
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
					{ account: walletAddress, market: marketAddress }
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
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!currencyKey && !!walletAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesOpenOrders;
