import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { getFuturesMarketContract } from './utils';

export type MarketPriceDetails = {
	marketSkew: Wei;
	takerFee: Wei;
	makerFee: Wei;
	assetPrice: Wei;
};

const useGetMarketPriceDetails = (
	currencyKey: string | null,
	options?: UseQueryOptions<MarketPriceDetails | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<MarketPriceDetails | null>(
		QUERY_KEYS.Futures.MarketPriceDetails(network.id, walletAddress, currencyKey),
		async () => {
			try {
				if (!currencyKey) return null;

				const { contracts } = synthetixjs!;
				const { FuturesMarketSettings } = contracts;
				const FuturesMarketContract = getFuturesMarketContract(currencyKey, contracts);

				const [marketSkew, takerFee, makerFee, assetPrice] = await Promise.all([
					FuturesMarketContract.marketSkew(),
					FuturesMarketSettings.takerFee(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketSettings.makerFee(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketContract.assetPrice(),
				]);

				return {
					marketSkew: wei(marketSkew),
					takerFee: wei(takerFee),
					makerFee: wei(makerFee),
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

export default useGetMarketPriceDetails;
