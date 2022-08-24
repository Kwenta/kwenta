import synthetix, { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAccount, chain, useNetwork, useProvider } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import { futuresMarketsState, futuresAccountState, positionsState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const { isConnected } = useAccount();
	const { chain: activeChain } = useNetwork();
	const isL2 =
		activeChain !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(activeChain?.id)
			: true;
	const provider = useProvider({
		chainId: isL2 && activeChain != null ? activeChain.id : chain.optimism.id,
	});
	const synthetixjs = synthetix({
		provider: provider,
		networkId: (activeChain?.unsupported
			? chain.optimism.id
			: activeChain?.id ?? chain.optimism.id) as NetworkId,
	});
	const [, setFuturesPositions] = useRecoilState(positionsState);

	const futuresMarkets = useRecoilValue(futuresMarketsState);

	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const assets = futuresMarkets
		.filter(({ asset }) => (activeChain?.id === 69 ? asset !== 'DYDX' : asset)) // Optimism Kovan has no contract FuturesMarketDYDX
		.map(({ asset }) => asset);

	return useQuery<FuturesPosition[] | []>(
		QUERY_KEYS.Futures.MarketsPositions(
			activeChain?.id as NetworkId,
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
