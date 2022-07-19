import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';
import { FuturesPosition } from './types';
import { MarketKeyByAsset } from 'utils/futures';
import { futuresAccountState, futuresMarketsState, positionsState } from 'store/futures';

const useGetFuturesPositionForMarkets = (
	markets: string[] | [],
	options?: UseQueryOptions<FuturesPosition[] | []>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const [, setFuturesPositions] = useRecoilState(positionsState);
	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const assets = futuresMarkets?.map(({ asset }) => asset) ?? [];
	const { synthetixjs, network } = Connector.useContainer();

	return useQuery<FuturesPosition[] | []>(
		QUERY_KEYS.Futures.MarketsPositions(assets || []),
		async () => {
			if (!markets || (selectedFuturesAddress && !isL2)) {
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
			enabled: isAppReady && isL2 && !!network && !!selectedFuturesAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
