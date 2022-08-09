import { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { appReadyState } from 'store/app';
import { futuresAccountState, marketKeysState } from 'store/futures';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { zeroBN } from 'utils/formatters/number';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

import useGetCrossMarginAccountOverview from './useGetCrossMarginAccountOverview';
import { mapFuturesPosition } from './utils';

const useGetCurrentPortfolioValue = (options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresAccount = useRecoilValue(futuresAccountState);
	const marketKeys = useRecoilValue(marketKeysState);

	const query = useGetCrossMarginAccountOverview();
	const freeMargin = query.data?.freeMargin || zeroBN;

	const { synthetixjs } = Connector.useContainer();

	return useQuery<any | null>(
		QUERY_KEYS.Futures.Positions(
			network.id,
			marketKeys || [],
			futuresAccount?.crossMarginAddress || ''
		),
		async () => {
			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;
			try {
				const positionsForIsolatedMarkets = await Promise.all(
					marketKeys.map((market) =>
						FuturesMarketData.positionDetailsForMarketKey(
							ethersUtils.formatBytes32String(market),
							walletAddress
						)
					)
				);

				const positionsForCrossMarginMarkets = futuresAccount?.crossMarginAddress
					? await Promise.all(
							marketKeys.map((market) =>
								FuturesMarketData.positionDetailsForMarketKey(
									ethersUtils.formatBytes32String(market),
									futuresAccount.crossMarginAddress
								)
							)
					  )
					: [];

				const combined = [...positionsForIsolatedMarkets, ...positionsForCrossMarginMarkets];

				const portfolioValue = combined
					.map((position, i) => {
						const mappedPosition = mapFuturesPosition(
							position,
							false,
							MarketAssetByKey[marketKeys[i]]
						);
						return mappedPosition.remainingMargin;
					})
					.reduce((sum, val) => sum.add(val), wei(0))
					.add(freeMargin);
				return !!portfolioValue ? portfolioValue : wei(0);
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && marketKeys.length > 0 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetCurrentPortfolioValue;
