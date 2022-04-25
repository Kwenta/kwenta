import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesMarketContract } from './utils';
import { FuturesPotentialTradeDetails } from './types';
import { PotentialTrade } from 'sections/futures/types';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

const useGetFuturesPotentialTradeDetails = (
	marketAsset: CurrencyKey | null,
	trade: PotentialTrade | null,
	options?: UseQueryOptions<FuturesPotentialTradeDetails | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const { synthetixjs } = Connector.useContainer();

	return useQuery<FuturesPotentialTradeDetails | null>(
		QUERY_KEYS.Futures.PotentialTrade(network.id, marketAsset || null, trade, walletAddress || ''),
		async () => {
			if (!marketAsset || !trade || !trade.size?.length) return null;

			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
			const newSize = trade.side === 'long' ? +trade.size : -trade.size;
			const { fee, liqPrice, margin, price, size } = await FuturesMarketContract.postTradeDetails(
				wei(newSize).toBN(),
				walletAddress
			);

			return {
				fee: wei(fee),
				liqPrice: wei(liqPrice),
				margin: wei(margin),
				price: wei(price),
				size: wei(size),
			};
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && !!marketAsset && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPotentialTradeDetails;
