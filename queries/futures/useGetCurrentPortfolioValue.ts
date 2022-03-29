import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition } from './utils';
import Wei, { wei } from '@synthetixio/wei';

const useGetCurrentPortfolioValue = (
	markets: string[] | [],
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<any | null>(
		QUERY_KEYS.Futures.Positions(network.id, markets || [], walletAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			if (!markets) return null;

			try {
				const positionsForMarkets = await Promise.all(
					(markets as string[]).map((market: string) =>
						Promise.all([
							FuturesMarketData.positionDetailsForMarketKey(
								ethersUtils.formatBytes32String(market),
								walletAddress
							),
						])
					)
				);

				const portfolioValue = positionsForMarkets
					.map(([position], i) => {
						const mappedPosition = mapFuturesPosition(position, false, markets[i]);
						return mappedPosition.remainingMargin;
					})
					.reduce((sum: Wei, val) => sum.add(val), wei(0));
				return !!portfolioValue ? portfolioValue : wei(0);
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && markets.length > 0 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetCurrentPortfolioValue;
