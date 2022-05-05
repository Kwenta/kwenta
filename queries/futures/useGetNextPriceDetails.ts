import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { getFuturesMarketContract } from './utils';

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

const useGetNextPriceDetails = (
	currencyKey: string | null,
	options?: UseQueryOptions<NextPriceDetails | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<NextPriceDetails | null>(
		QUERY_KEYS.Futures.NextPriceDetails(network.id, walletAddress, currencyKey),
		async () => {
			try {
				if (!currencyKey) return null;

				const { contracts } = synthetixjs!;
				const { ExchangeRates, FuturesMarketSettings } = contracts;
				const FuturesMarketContract = getFuturesMarketContract(currencyKey, contracts);

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
					ExchangeRates.getCurrentRoundId(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketSettings.minKeeperFee(),
					FuturesMarketContract.marketSkew(),
					FuturesMarketSettings.takerFee(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketSettings.makerFee(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketSettings.takerFeeNextPrice(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketSettings.makerFeeNextPrice(ethersUtils.formatBytes32String(currencyKey)),
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
		{ enabled: isAppReady && isL2 && !!currencyKey && !!walletAddress, ...options }
	);
};

export default useGetNextPriceDetails;
