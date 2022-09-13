import { NetworkId } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { ETH_UNIT } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { futuresAccountState, marketInfoState } from 'store/futures';
import logError from 'utils/logError';

import { getFuturesEndpoint } from './utils';

const useGetFuturesOpenOrders = (options?: UseQueryOptions<any>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const { network } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const isL2 = useIsL2();
	const marketInfo = useRecoilValue(marketInfoState);

	return useQuery<any>(
		QUERY_KEYS.Futures.Orders(network.id as NetworkId, selectedFuturesAddress),
		async () => {
			try {
				const marketAsset = marketInfo?.assetHex;
				const response = await request(
					futuresEndpoint,
					gql`
						query Orders($account: String!, $asset: String!) {
							futuresOrders(
								where: { abstractAccount: $account, asset: $asset }
								orderBy: timestamp
								orderDirection: desc
							) {
								id
								account
								abstractAccount
								size
								market
								asset
								orderId
								targetRoundId
								timestamp
								orderType
								status
							}
						}
					`,
					{ account: selectedFuturesAddress, asset: marketAsset }
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
			enabled: isL2 && !!marketInfo?.market && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesOpenOrders;
