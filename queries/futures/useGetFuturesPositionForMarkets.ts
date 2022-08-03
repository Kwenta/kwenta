import synthetix, { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAccount, chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { futuresMarketsState, positionsState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';
import { getDefaultProvider } from 'utils/network';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const { address: walletAddress, isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismKovan.id].includes(activeChain?.id)
			: false;
	const synthetixjs = synthetix({
		provider: getDefaultProvider((activeChain?.id ?? chain.optimism.id) as NetworkId),
		networkId: (activeChain?.id ?? chain.optimism.id) as NetworkId,
		useOvm: true,
	});
	const [, setFuturesPositions] = useRecoilState(positionsState);

	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const assets = futuresMarkets
		.filter(({ asset }) => (activeChain?.id === 69 ? asset !== 'DYDX' : asset)) // Optimism Kovan has no contract FuturesMarketDYDX
		.map(({ asset }) => asset);

	return useQuery<FuturesPosition[] | []>(
		QUERY_KEYS.Futures.MarketsPositions(
			activeChain?.id as NetworkId,
			walletAddress ?? '',
			assets || []
		),
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
			enabled: isAppReady && isL2 && !!isConnected && !!walletAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
