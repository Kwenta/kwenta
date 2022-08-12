import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { futuresMarketsState, futuresAccountState, positionsState } from 'store/futures';
import { isL2State } from 'store/wallet';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const { synthetixjs, network } = Connector.useContainer();
	const setFuturesPositions = useSetRecoilState(positionsState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const assets = futuresMarkets.map(({ asset }) => asset);

	return useQuery<FuturesPosition[]>(
		QUERY_KEYS.Futures.MarketsPositions(network.id, assets || [], selectedFuturesAddress || ''),
		async () => {
			if (!assets || !selectedFuturesAddress || (selectedFuturesAddress && !isL2)) {
				setFuturesPositions([]);
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
							selectedFuturesAddress
						),
						getFuturesMarketContract(asset, synthetixjs!.contracts).canLiquidate(
							selectedFuturesAddress
						),
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
			enabled: isAppReady && isL2 && !!network && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
