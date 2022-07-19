import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { getFuturesMarketContract } from './utils';
import { futuresAccountState, marketKeyState } from 'store/futures';

export type NextPriceDetails = {
	keeperDeposit: Wei;
	currentRoundId: Wei;
	marketSkew: Wei;
	takerFee: Wei;
	makerFee: Wei;
	takerFeeNextPrice: Wei;
	makerFeeNextPrice: Wei;
	assetPrice: Wei;
};

const useGetNextPriceDetails = (options?: UseQueryOptions<NextPriceDetails | null>) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const marketKey = useRecoilValue(marketKeyState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<NextPriceDetails | null>(
		QUERY_KEYS.Futures.NextPriceDetails(network.id, selectedFuturesAddress, marketKey),
		async () => {
			try {
				const { contracts } = synthetixjs!;
				const { ExchangeRates, FuturesMarketSettings } = contracts;
				const FuturesMarketContract = getFuturesMarketContract(marketKey, contracts);

				const [
					currentRoundId,
					keeperDeposit,
					marketSkew,
					takerFee,
					makerFee,
					takerFeeNextPrice,
					makerFeeNextPrice,
					assetPrice,
				] = await Promise.all([
					ExchangeRates.getCurrentRoundId(ethersUtils.formatBytes32String(marketKey)),
					FuturesMarketSettings.minKeeperFee(),
					FuturesMarketContract.marketSkew(),
					FuturesMarketSettings.takerFee(ethersUtils.formatBytes32String(marketKey)),
					FuturesMarketSettings.makerFee(ethersUtils.formatBytes32String(marketKey)),
					FuturesMarketSettings.takerFeeNextPrice(ethersUtils.formatBytes32String(marketKey)),
					FuturesMarketSettings.makerFeeNextPrice(ethersUtils.formatBytes32String(marketKey)),
					FuturesMarketContract.assetPrice(),
				]);

				return {
					keeperDeposit: wei(keeperDeposit),
					currentRoundId: wei(currentRoundId, 0),
					marketSkew: wei(marketSkew),
					takerFee: wei(takerFee),
					makerFee: wei(makerFee),
					takerFeeNextPrice: wei(takerFeeNextPrice),
					makerFeeNextPrice: wei(makerFeeNextPrice),
					assetPrice: wei(assetPrice[0]),
				};
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!marketKey && !!selectedFuturesAddress,
			refetchInterval: 5000,
			...options,
		}
	);
};

export default useGetNextPriceDetails;
