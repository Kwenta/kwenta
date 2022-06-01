import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesMarketContract } from './utils';
import { FuturesPotentialTradeDetails } from './types';
import {
	PotentialTrade,
	PotentialTradeStatus,
	POTENTIAL_TRADE_STATUS_TO_MESSAGE,
} from 'sections/futures/types';
import { CurrencyKey } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';

const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';

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

	const getStatusMessage = (status: PotentialTradeStatus): string => {
		if (typeof status !== 'number') {
			return UNKNOWN;
		}

		if (status === 0) {
			return SUCCESS;
		} else if (PotentialTradeStatus[status]) {
			return POTENTIAL_TRADE_STATUS_TO_MESSAGE[PotentialTradeStatus[status]];
		} else {
			return UNKNOWN;
		}
	};

	return useQuery<FuturesPotentialTradeDetails | null>(
		QUERY_KEYS.Futures.PotentialTrade(network.id, marketAsset || null, trade, walletAddress || ''),
		async () => {
			if (!marketAsset || !trade || !trade.size?.length || !isL2) return null;

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
			const newSize = trade.side === 'long' ? +trade.size : -trade.size;

			const [globals, { fee, liqPrice, margin, price, size, status }] = await Promise.all([
				await FuturesMarketData.globals(),
				await FuturesMarketContract.postTradeDetails(wei(newSize).toBN(), walletAddress),
			]);

			return {
				fee: wei(fee),
				liqPrice: wei(liqPrice),
				margin: wei(margin),
				price: wei(price),
				size: wei(size),
				side: trade.side,
				leverage: wei(trade.leverage),
				notionalValue: wei(size).mul(wei(price)),
				minInitialMargin: wei(globals.minInitialMargin),
				status,
				showStatus: status > 0, // 0 is success
				statusMessage: getStatusMessage(status),
			};
		},
		{
			enabled: isAppReady && isL2 && !!walletAddress && !!marketAsset && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPotentialTradeDetails;
