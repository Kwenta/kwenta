import { useQuery, QueryConfig } from 'react-query';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import synthetix from 'lib/synthetix';
import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { toBigNumber } from 'utils/formatters/number';

export type FuturesMarket = {
	market: string;
	asset: string;
	assetHex: string;
	currentFundingRate: BigNumber;
	feeRates: {
		makerFee: BigNumber;
		takerFee: BigNumber;
	};
	marketDebt: BigNumber;
	marketSkew: BigNumber;
	maxLeverage: BigNumber;
	price: BigNumber;
};

const useGetFuturesMarkets = (options?: QueryConfig<[FuturesMarket]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<[FuturesMarket]>(
		QUERY_KEYS.Futures.Markets,
		async () => {
			const {
				contracts: { FuturesMarketData },
				utils,
			} = synthetix.js!;
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
					price,
				}: FuturesMarket) => ({
					market: market,
					asset: utils.parseBytes32String(asset),
					assetHex: asset,
					currentFundingRate: toBigNumber(currentFundingRate.toString()),
					feeRates: {
						makerFee: toBigNumber(feeRates.makerFee.toString()),
						takerFee: toBigNumber(feeRates.takerFee.toString()),
					},
					marketDebt: toBigNumber(marketDebt.toString()),
					marketSkew: toBigNumber(marketSkew.toString()),
					maxLeverage: toBigNumber(maxLeverage.toString()),
					price: toBigNumber(price.toString()),
				})
			);
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress,
			...options,
		}
	);
};

export default useGetFuturesMarkets;
