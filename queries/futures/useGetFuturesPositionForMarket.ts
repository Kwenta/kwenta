import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';
import { FuturesPosition } from './types';

const useGetFuturesPositionForMarket = (
	market: string | null,
	options?: UseQueryOptions<FuturesPosition | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<FuturesPosition | null>(
		QUERY_KEYS.Futures.Position(market || null, walletAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			if (!market) return null;

			const [futuresPosition, canLiquidatePosition] = await Promise.all([
				FuturesMarketData.positionDetailsForAsset(
					ethersUtils.formatBytes32String(market),
					walletAddress
				),
				getFuturesMarketContract(market, synthetixjs!.contracts).canLiquidate(walletAddress),
			]);

			return mapFuturesPosition(futuresPosition, canLiquidatePosition, market);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && !!market && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarket;
