import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider, Contract } from 'ethcall';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import FuturesMarketABI from 'lib/abis/FuturesMarket.json';
import FuturesMarketDataABI from 'lib/abis/FuturesMarketData.json';
import { positionsState, futuresAccountState, futuresMarketsState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesAccountTypes, FuturesMarket, PositionDetail } from './types';
import { mapFuturesPosition } from './utils';

const ethCallProvider = new Provider();

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<any>) => {
	const {
		defaultSynthetixjs,
		l2Synthetixjs,
		provider,
		l2Provider,
		network,
	} = Connector.useContainer();
	const isL2 = useIsL2();
	const synthetixjs = isL2 ? defaultSynthetixjs : l2Synthetixjs;

	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const [positions, setPositions] = useRecoilState(positionsState);
	const { walletAddress, crossMarginAddress, crossMarginAvailable, status } = useRecoilValue(
		futuresAccountState
	);
	const assets = futuresMarkets.map(({ asset }) => asset);

	return useQuery<any>(
		QUERY_KEYS.Futures.MarketsPositions(
			network?.id as NetworkId,
			assets || [],
			walletAddress ?? '',
			crossMarginAddress ?? ''
		),
		async () => {
			await ethCallProvider.init(isL2 ? provider : l2Provider);

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const FMD = new Contract(FuturesMarketData.address, FuturesMarketDataABI);

			const positionCalls = [];
			const liquidationCalls = [];

			// isolated margin
			for (const { market, asset } of futuresMarkets) {
				positionCalls.push(
					FMD.positionDetailsForMarketKey(
						ethersUtils.formatBytes32String(MarketKeyByAsset[asset]),
						walletAddress
					)
				);
				const marketContract = new Contract(market, FuturesMarketABI);
				liquidationCalls.push(marketContract.canLiquidate(walletAddress));
			}

			// cross margin
			if (crossMarginAvailable && crossMarginAddress) {
				for (const { market, asset } of futuresMarkets) {
					positionCalls.push(
						FMD.positionDetailsForMarketKey(
							ethersUtils.formatBytes32String(MarketKeyByAsset[asset]),
							crossMarginAddress
						)
					);
					const marketContract = new Contract(market, FuturesMarketABI);
					liquidationCalls.push(marketContract.canLiquidate(crossMarginAddress));
				}
			}

			const positionDetails = (await ethCallProvider.all(positionCalls)) as PositionDetail[];
			const canLiquidateState = (await ethCallProvider.all(liquidationCalls)) as boolean[];

			const isolatedPositions = futuresMarkets
				.map((futuresMarket: FuturesMarket, ind: number) => {
					const position = positionDetails[ind];
					const canLiquidate = canLiquidateState[ind];
					const asset = assets[ind];
					return mapFuturesPosition(position, canLiquidate, asset);
				})
				.filter(({ remainingMargin }) => remainingMargin.gt(0));

			const crossPositions =
				crossMarginAvailable && crossMarginAddress
					? futuresMarkets
							.map((futuresMarket: FuturesMarket, ind: number) => {
								const position = positionDetails[futuresMarkets.length + ind];
								const canLiquidate = canLiquidateState[futuresMarkets.length + ind];
								const asset = assets[ind];
								return mapFuturesPosition(position, canLiquidate, asset);
							})
							.filter(({ remainingMargin }) => remainingMargin.gt(0))
					: [];

			setPositions({
				...positions,
				[FuturesAccountTypes.ISOLATED_MARGIN]: isolatedPositions,
				[FuturesAccountTypes.CROSS_MARGIN]: crossPositions,
			});
		},
		{
			enabled: !!assets && !!provider && !!l2Provider && status === 'complete',
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
