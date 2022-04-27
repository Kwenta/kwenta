import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';
import Wei, { wei } from '@synthetixio/wei';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';

type NextPriceDetails = {
	keeperDeposit: Wei;
	currentRoundId: Wei;
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
		QUERY_KEYS.Futures.NextPriceDetails(network.id, walletAddress),
		async () => {
			try {
				if (!currencyKey) return null;
				const {
					contracts: { ExchangeRates, FuturesMarketSettings },
				} = synthetixjs!;

				const [currentRoundId, keeperDeposit] = await Promise.all([
					ExchangeRates.getCurrentRoundId(ethersUtils.formatBytes32String(currencyKey)),
					FuturesMarketSettings.minKeeperFee(),
				]);

				return { keeperDeposit: wei(keeperDeposit), currentRoundId: wei(currentRoundId, 0) };
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey && !!walletAddress, ...options }
	);
};

export default useGetNextPriceDetails;
