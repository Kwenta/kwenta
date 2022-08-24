import { NetworkId } from '@synthetixio/contracts-interface';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { marketKeyState, futuresAccountState, positionState } from 'store/futures';
import { MarketAssetByKey } from 'utils/futures';

import { FuturesPosition } from './types';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';

const useGetFuturesPositionForMarket = (options?: UseQueryOptions<FuturesPosition | null>) => {
	const { chain: network } = useNetwork();
	const isL2 =
		network !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(network?.id)
			: true;
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const market = useRecoilValue(marketKeyState);
	const setPosition = useSetRecoilState(positionState);

	return useQuery<FuturesPosition | null>(
		QUERY_KEYS.Futures.Position(
			network?.id as NetworkId,
			market || null,
			selectedFuturesAddress || ''
		),
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

			const position = mapFuturesPosition(
				futuresPosition,
				canLiquidatePosition,
				MarketAssetByKey[market]
			);

			setPosition(position);

			return position;
		},
		{
			enabled: isL2 && !!selectedFuturesAddress && !!market && !!synthetixjs,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarket;
