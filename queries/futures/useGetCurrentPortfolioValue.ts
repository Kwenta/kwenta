import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import {
	crossMarginAvailableMarginState,
	futuresAccountState,
	marketKeysState,
} from 'store/futures';
import { MarketAssetByKey } from 'utils/futures';
import logError from 'utils/logError';

import { mapFuturesPosition } from './utils';

const useGetCurrentPortfolioValue = (options?: UseQueryOptions<any | null>) => {
	const { defaultSynthetixjs: synthetixjs, network, walletAddress } = Connector.useContainer();
	const isL2 = useIsL2();

	const futuresAccount = useRecoilValue(futuresAccountState);
	const marketKeys = useRecoilValue(marketKeysState);
	const freeMargin = useRecoilValue(crossMarginAvailableMarginState);

	return useQuery<any | null>(
		QUERY_KEYS.Futures.Portfolio(
			network?.id as NetworkId,
			marketKeys || [],
			walletAddress,
			futuresAccount?.crossMarginAddress,
			freeMargin.toNumber()
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
			enabled: isL2 && !!walletAddress && marketKeys.length > 0 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetCurrentPortfolioValue;
