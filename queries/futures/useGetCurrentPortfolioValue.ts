import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition } from './utils';
import { FuturesPosition } from './types';

const useGetCurrentPortfolioValue = (
	markets: string[] | [],
	options?: UseQueryOptions<Number | never[]>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<Number | never[]>(
		QUERY_KEYS.Futures.Positions(markets || [], walletAddress || ''),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			if (!markets) return [];

			const positionsForMarkets = await Promise.all(
				(markets as [string]).map((market: string) =>
					Promise.all([
						FuturesMarketData.positionDetailsForAsset(
							ethersUtils.formatBytes32String(market),
							walletAddress
						)
					])
				)
			);
			
			const portfolioValue = positionsForMarkets
				.map(([position], i) => {
					const mappedPosition = mapFuturesPosition(position, false, markets[i]);
					return mappedPosition.remainingMargin.add(mappedPosition?.position?.roi || 0).toNumber();
				})
				.reduce((sum, val) => sum + val, 0);
			console.log(portfolioValue)
			return !!portfolioValue ? portfolioValue : 0;
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && markets.length > 0 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetCurrentPortfolioValue;
