import { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { marketKeyState, positionState, selectedFuturesAddressState } from 'store/futures';
import { MarketAssetByKey } from 'utils/futures';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarket = (options?: UseQueryOptions<FuturesPosition | null>) => {
	const { defaultSynthetixjs: synthetixjs, network } = Connector.useContainer();
	const isL2 = useIsL2();
	const selectedFuturesAddress = useRecoilValue(selectedFuturesAddressState);
	const market = useRecoilValue(marketKeyState);
	const setPosition = useSetRecoilState(positionState);

	return useQuery<FuturesPosition | null>(
		QUERY_KEYS.Futures.Position(
			network?.id as NetworkId,
			market || null,
			selectedFuturesAddress || ''
		),
		async () => {
			if (!isL2 || !market || !selectedFuturesAddress || !synthetixjs) {
				setPosition(null);
				return null;
			}
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs;

			const [futuresPosition, canLiquidatePosition] = await Promise.all([
				FuturesMarketData.positionDetailsForMarketKey(
					ethersUtils.formatBytes32String(market),
					selectedFuturesAddress
				),
				getFuturesMarketContract(market, synthetixjs!.contracts).canLiquidate(
					selectedFuturesAddress
				),
			]);

			const position = mapFuturesPosition(
				futuresPosition,
				canLiquidatePosition,
				MarketAssetByKey[market]
			);

			setPosition(position);

			return position;
		},
		{
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarket;
