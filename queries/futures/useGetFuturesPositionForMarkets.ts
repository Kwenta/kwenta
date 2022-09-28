import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider, Contract } from 'ethcall';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import FuturesMarketABI from 'lib/abis/FuturesMarket.json';
import FuturesMarketDataABI from 'lib/abis/FuturesMarketData.json';
import { futuresMarketsState, futuresAccountState, positionsState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesMarket, FuturesPosition, PositionDetail } from './types';
import { mapFuturesPosition } from './utils';

const ethCallProvider = new Provider();

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const {
		defaultSynthetixjs,
		l2Synthetixjs,
		provider,
		l2Provider,
		network,
		isWalletConnected,
	} = Connector.useContainer();
	const isL2 = useIsL2();
	const synthetixjs = isL2 ? defaultSynthetixjs : l2Synthetixjs;

	const setFuturesPositions = useSetRecoilState(positionsState);

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
			if (!assets || (!provider && !l2Provider) || !selectedFuturesAddress) {
				setFuturesPositions([]);
				return [];
			}

			await ethCallProvider.init(isL2 ? provider : l2Provider);

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const FMD = new Contract(FuturesMarketData.address, FuturesMarketDataABI);

			const positionCalls = [];
			const liquidationCalls = [];

			for (const { market, asset } of futuresMarkets) {
				positionCalls.push(
					FMD.positionDetailsForMarketKey(
						ethersUtils.formatBytes32String(MarketKeyByAsset[asset]),
						selectedFuturesAddress
					)
				);
				const marketContract = new Contract(market, FuturesMarketABI);
				liquidationCalls.push(marketContract.canLiquidate(selectedFuturesAddress));
			}

			const positions = (await ethCallProvider.all(positionCalls)) as PositionDetail[];
			const canLiquidateState = (await ethCallProvider.all(liquidationCalls)) as boolean[];

			const futuresPositions = futuresMarkets.map((futuresMarket: FuturesMarket, ind: number) => {
				const position = positions[ind];
				const canLiquidate = canLiquidateState[ind];
				const asset = assets[ind];
				return mapFuturesPosition(position, canLiquidate, asset);
			});
			setFuturesPositions(futuresPositions);

			return futuresPositions;
		},
		{
			enabled: isL2 && !!isWalletConnected && !!selectedFuturesAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
