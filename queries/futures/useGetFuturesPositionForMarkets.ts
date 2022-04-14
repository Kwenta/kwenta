import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition, getFuturesMarketContract } from './utils';
import { FuturesPosition } from './types';
import { getMarketAssetFromKey } from 'utils/futures';

const useGetFuturesPositionForMarkets = (
	markets: string[] | [],
	options?: UseQueryOptions<FuturesPosition[] | []>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs, network } = Connector.useContainer();

	return useQuery<FuturesPosition[] | []>(
		QUERY_KEYS.Futures.MarketsPositions(markets || []),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			if (!markets) return [];

			const positionsForMarkets = await Promise.all(
				(markets as [string]).map((market: string) =>
					Promise.all([
						FuturesMarketData.positionDetailsForMarketKey(
							ethersUtils.formatBytes32String(market),
							walletAddress
						),
						getFuturesMarketContract(market, synthetixjs!.contracts).canLiquidate(walletAddress),
					])
				)
			);

			return positionsForMarkets.map(([position, canLiquidate], i) =>
				mapFuturesPosition(position, canLiquidate, getMarketAssetFromKey(markets[i], network.id))
			);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && markets.length > 0 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPositionForMarkets;
