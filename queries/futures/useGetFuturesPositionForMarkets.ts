import { NetworkId } from '@synthetixio/contracts-interface';
import { Provider, Contract } from 'ethcall';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useAccount, useNetwork, useProvider } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import FuturesMarketABI from 'lib/abis/FuturesMarket.json';
import FuturesMarketDataABI from 'lib/abis/FuturesMarketData.json';
import { futuresMarketsState, futuresAccountState, positionsState } from 'store/futures';
import { MarketKeyByAsset } from 'utils/futures';

import { FuturesPosition, PositionDetail } from './types';
import { mapFuturesPosition } from './utils';

const ethCallProvider = new Provider();

const useGetFuturesPositionForMarkets = (options?: UseQueryOptions<FuturesPosition[]>) => {
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const { isConnected } = useAccount();
	const { chain: network } = useNetwork();
	const isL2 = useIsL2();
	const provider = useProvider();
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
			if (!assets || !provider || (selectedFuturesAddress && !isL2)) return [];

			await ethCallProvider.init(provider);

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

			const futuresPositions = [];

			for (let i = 0; i < futuresMarkets.length; i++) {
				const position = positions[i];
				const canLiquidate = canLiquidateState[i];

				futuresPositions.push(mapFuturesPosition(position, canLiquidate, assets[i]));
			}

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
