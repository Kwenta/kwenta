import { NetworkId } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import { ETH_UNIT } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { futuresAccountState, openOrdersState, marketInfoState } from 'store/futures';
import { formatCurrency } from 'utils/formatters/number';
import { FuturesMarketAsset, getMarketName, MarketKeyByAsset } from 'utils/futures';
import logError from 'utils/logError';

import { PositionSide, FuturesOrder } from './types';
import { getFuturesEndpoint } from './utils';

const useGetFuturesOpenOrders = (options?: UseQueryOptions<any>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const { network, synthsMap } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	const marketInfo = useRecoilValue(marketInfoState);
	const setOpenOrders = useSetRecoilState(openOrdersState);

	return useQuery<FuturesOrder[]>(
		QUERY_KEYS.Futures.OpenOrders(network?.id as NetworkId, selectedFuturesAddress),
		async () => {
			if (!selectedFuturesAddress) {
				setOpenOrders([]);
				return [];
			}
			try {
				const marketAsset = marketInfo?.assetHex;
				const response = await request(
					futuresEndpoint,
					gql`
						query OpenOrders($account: String!, $asset: String!) {
							futuresOrders(where: { abstractAccount: $account, asset: $asset, status: Pending }) {
								id
								account
								size
								market
								asset
								targetRoundId
								targetPrice
								timestamp
								orderType
							}
						}
					`,
					{ account: selectedFuturesAddress, asset: marketAsset }
				);

				const openOrders: FuturesOrder[] = response
					? response.futuresOrders.map((o: FuturesOrder) => {
							const asset: FuturesMarketAsset = ethersUtils.parseBytes32String(
								o.asset
							) as FuturesMarketAsset;
							const size = new Wei(o.size).div(ETH_UNIT);
							const targetPrice = new Wei(o.targetPrice).div(ETH_UNIT);
							const targetRoundId = new Wei(o.targetRoundId, 0);
							return {
								...o,
								asset: asset,
								targetRoundId: targetRoundId,
								targetPrice: targetPrice.gt(0) ? targetPrice : null,
								size: size,
								market: getMarketName(asset),
								marketKey: MarketKeyByAsset[asset],
								orderType: o.orderType === 'NextPrice' ? 'Next-Price' : o.orderType,
								sizeTxt: formatCurrency(asset, size.abs(), {
									sign: asset ? synthsMap[asset]?.sign : '',
									minDecimals: size.abs().lt(0.01) ? 4 : 2,
								}),
								targetPriceTxt: formatCurrency(asset, targetPrice, {
									sign: '$',
									minDecimals: targetPrice.lt(0.01) ? 4 : 2,
								}),
								side: size.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
								isStale:
									o.orderType === 'NextPrice' &&
									wei(marketInfo?.currentRoundId ?? 0).gte(wei(o.targetRoundId).add(2)),
								isExecutable: targetRoundId
									? wei(marketInfo?.currentRoundId ?? 0).eq(targetRoundId) ||
									  wei(marketInfo?.currentRoundId ?? 0).eq(targetRoundId.add(1))
									: false,
							};
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
			enabled: !!marketInfo?.market && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesOpenOrders;
