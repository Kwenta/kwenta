import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { mapFuturesPosition } from './utils';
import Wei, { wei } from '@synthetixio/wei';

const useGetAverageFundingRate = (
	currencyKey: string | null,
	options?: UseQueryOptions<any | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<any | null>(
		QUERY_KEYS.Futures.FundingRate(currencyKey || ''),
		async () => {
			if (!currencyKey || !synthetixjs) return null;
			const futuresMarket = synthetixjs.contracts[`FuturesMarket${currencyKey}`]
			// console.log(futuresMarket)

			try {
				const fundingLength = await futuresMarket.fundingSequenceLength()
				const fundingRate = await futuresMarket.fundingSequence(fundingLength - 1)
				console.log(wei(fundingRate))
				// const positionsForMarkets = await Promise.all(
				// 	FuturesMarketData.positionDetailsForMarketKey(
				// 		ethersUtils.formatBytes32String("BTC"),
				// 	),
				// );

				return null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!synthetixjs,
			...options,
		}
	);
};

export default useGetAverageFundingRate;
