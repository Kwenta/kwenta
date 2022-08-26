import { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAccount, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { futuresMarketsState, futuresAccountState, positionsState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const { isConnected } = useAccount();
	const { chain: network } = useNetwork();
	const isL2 = useIsL2(network?.id as NetworkId);

	const [, setFuturesPositions] = useRecoilState(positionsState);

	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const assets = futuresMarkets.map(({ asset }) => asset);

	return useQuery<FuturesPosition[] | []>(
		QUERY_KEYS.Futures.MarketsPositions(
			network?.id as NetworkId,
			assets || [],
			selectedFuturesAddress ?? ''
		),
		async () => {
			if (!assets || (selectedFuturesAddress && !isL2)) {
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
			enabled: isL2 && !!isConnected && !!selectedFuturesAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
