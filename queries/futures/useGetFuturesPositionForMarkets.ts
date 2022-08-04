import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { futuresMarketsState, positionsState } from 'store/futures';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();
	const setFuturesPositions = useSetRecoilState(positionsState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const assets = futuresMarkets.map(({ asset }) => asset);

	return useQuery<FuturesPosition[]>(
		QUERY_KEYS.Futures.MarketsPositions(network.id, walletAddress, assets || []),
		async () => {
			if (!assets || (walletAddress && !isL2)) {
				return [];
			}

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const positionsForMarkets = await Promise.all(
				assets.map((asset) => {
					return Promise.all([
						FuturesMarketData.positionDetailsForMarketKey(
							ethersUtils.formatBytes32String(MarketKeyByAsset[asset]),
							walletAddress
						),
						getFuturesMarketContract(asset, synthetixjs!.contracts).canLiquidate(walletAddress),
					]);
				})
			);

			const futuresPositions = positionsForMarkets.map(([position, canLiquidate], i) =>
				mapFuturesPosition(position, canLiquidate, assets[i])
			);

			setFuturesPositions(futuresPositions);

			return futuresPositions;
		},
		{
			enabled: isAppReady && isL2 && !!network && !!walletAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
