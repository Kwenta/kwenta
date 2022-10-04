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

const DEFAULT_POSITIONS = {
	[FuturesAccountTypes.ISOLATED_MARGIN]: [],
	[FuturesAccountTypes.CROSS_MARGIN]: [],
};

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<void>) => {
	const { defaultSynthetixjs: synthetixjs, provider, network } = Connector.useContainer();
	const isL2 = useIsL2();

	const futuresMarkets = useRecoilValue(futuresMarketsState);
	const [positions, setPositions] = useRecoilState(positionsState);
	const { walletAddress, crossMarginAddress, crossMarginAvailable, status } = useRecoilValue(
		futuresAccountState
	);
	const assets = futuresMarkets.map(({ asset }) => asset);

	return useQuery<void>(
		QUERY_KEYS.Futures.MarketsPositions(
			network?.id as NetworkId,
			assets || [],
			walletAddress ?? '',
			crossMarginAddress ?? ''
		),
		async () => {
			if (!isL2 || !provider || status !== 'complete') {
				setPositions(DEFAULT_POSITIONS);
				return;
			}

			const ethcallProvider = new Provider();
			await ethcallProvider.init(provider);

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

			const positionDetails = (await ethcallProvider.all(positionCalls)) as PositionDetail[];
			const canLiquidateState = (await ethcallProvider.all(liquidationCalls)) as boolean[];

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
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
