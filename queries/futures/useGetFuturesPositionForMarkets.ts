import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider, Contract } from 'ethcall';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import FuturesMarketABI from 'sdk/contracts/abis/FuturesMarket.json';
import FuturesMarketDataABI from 'sdk/contracts/abis/FuturesMarketData.json';
import { selectMarkets } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { positionsState, futuresAccountState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesAccountTypes, PositionDetail } from './types';
import { mapFuturesPosition } from './utils';

const DEFAULT_POSITIONS = {
	[FuturesAccountTypes.ISOLATED_MARGIN]: [],
	[FuturesAccountTypes.CROSS_MARGIN]: [],
};

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<void>) => {
	const { defaultSynthetixjs: synthetixjs, provider, network } = Connector.useContainer();
	const isL2 = useIsL2();

	const futuresMarkets = useAppSelector(selectMarkets);
	const setPositions = useSetRecoilState(positionsState);
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

			// split isolated and cross margin results
			const positionDetailsIsolated = positionDetails.slice(0, futuresMarkets.length);
			const positionDetailsCross = positionDetails.slice(
				futuresMarkets.length,
				positionDetails.length
			);

			const canLiquidateStateIsolated = canLiquidateState.slice(0, futuresMarkets.length);
			const canLiquidateStateCross = canLiquidateState.slice(
				futuresMarkets.length,
				canLiquidateState.length
			);

			// map the positions using the results
			const isolatedPositions = positionDetailsIsolated
				.map((position, ind) => {
					const canLiquidate = canLiquidateStateIsolated[ind];
					const asset = assets[ind];
					return mapFuturesPosition(position, canLiquidate, asset);
				})
				.filter(({ remainingMargin }) => remainingMargin.gt(0));

			const crossPositions = positionDetailsCross
				.map((position, ind) => {
					const canLiquidate = canLiquidateStateCross[ind];
					const asset = assets[ind];
					return mapFuturesPosition(position, canLiquidate, asset);
				})
				.filter(({ remainingMargin }) => remainingMargin.gt(0));

			setPositions({
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
