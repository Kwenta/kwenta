import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';
import { FuturesPosition } from './types';
import { currentMarketState, futuresAccountState, positionState } from 'store/futures';

const useGetFuturesPositionForMarket = (options?: UseQueryOptions<FuturesPosition | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const { synthetixjs } = Connector.useContainer();
	const market = useRecoilValue(currentMarketState);
	const setPosition = useSetRecoilState(positionState);

	return useQuery<FuturesPosition | null>(
		QUERY_KEYS.Futures.Position(network.id, market || null, selectedFuturesAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			if (!market) return null;

			const [futuresPosition, canLiquidatePosition] = await Promise.all([
				FuturesMarketData.positionDetailsForMarketKey(
					ethersUtils.formatBytes32String(market),
					selectedFuturesAddress
				),
				getFuturesMarketContract(market, synthetixjs!.contracts).canLiquidate(
					selectedFuturesAddress
				),
			]);

			const position = mapFuturesPosition(futuresPosition, canLiquidatePosition, market);

			setPosition(position);

			return position;
		},
		{
			enabled: isAppReady && isL2 && !!selectedFuturesAddress && !!market && !!synthetixjs,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarket;
