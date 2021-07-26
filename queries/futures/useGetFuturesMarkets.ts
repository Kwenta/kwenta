import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import Connector from 'containers/Connector';
import QUERY_KEYS from 'constants/queryKeys';
import { FuturesMarket } from './types';

const useGetFuturesMarkets = (options?: UseQueryOptions<[FuturesMarket]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<[FuturesMarket]>(
		QUERY_KEYS.Futures.Markets,
		async () => {
			const {
				contracts: { FuturesMarketData },
				utils,
			} = synthetixjs!;

			const markets = await FuturesMarketData.allMarketSummaries();
			return markets.map(
				({
					market,
					asset,
					currentFundingRate,
					feeRates,
					marketDebt,
					marketSkew,
					maxLeverage,
					marketSize,
					price,
				}: FuturesMarket) => ({
					market: market,
					asset: utils.parseBytes32String(asset),
					assetHex: asset,
					currentFundingRate: wei(currentFundingRate),
					feeRates: {
						makerFee: wei(feeRates.makerFee),
						takerFee: wei(feeRates.takerFee),
					},
					marketDebt: wei(marketDebt),
					marketSkew: wei(marketSkew),
					maxLeverage: wei(maxLeverage),
					marketSize: wei(marketSize),
					price: wei(price),
				})
			);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesMarkets;
