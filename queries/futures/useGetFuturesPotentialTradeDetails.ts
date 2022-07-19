import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';
import Connector from 'containers/Connector';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesMarketContract } from './utils';
import { FuturesPotentialTradeDetails } from './types';
import { PotentialTradeStatus, POTENTIAL_TRADE_STATUS_TO_MESSAGE } from 'sections/futures/types';
import { wei } from '@synthetixio/wei';
import {
	currentMarketState,
	futuresAccountState,
	leverageSideState,
	leverageState,
	potentialTradeDetailsState,
	tradeSizeState,
} from 'store/futures';

const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';

const useGetFuturesPotentialTradeDetails = (
	options?: UseQueryOptions<FuturesPotentialTradeDetails | null>
) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	const tradeSize = useRecoilValue(tradeSizeState);
	const leverageSide = useRecoilValue(leverageSideState);
	const leverage = useRecoilValue(leverageState);
	const marketAsset = useRecoilValue(currentMarketState);

	const [, setPotentialTradeDetails] = useRecoilState(potentialTradeDetailsState);

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
		QUERY_KEYS.Futures.PotentialTrade(
			network.id,
			marketAsset || null,
			tradeSize,
			selectedFuturesAddress || ''
		),
		async () => {
			if (!marketAsset || !tradeSize || !isL2) {
				setPotentialTradeDetails(null);
				return null;
			}

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);
			const newSize = leverageSide === 'long' ? tradeSize : -tradeSize;

			const [globals, { fee, liqPrice, margin, price, size, status }] = await Promise.all([
				await FuturesMarketData.globals(),
				await FuturesMarketContract.postTradeDetails(wei(newSize).toBN(), selectedFuturesAddress),
			]);

			const potentialTradeDetails = {
				fee: wei(fee),
				liqPrice: wei(liqPrice),
				margin: wei(margin),
				price: wei(price),
				size: wei(size),
				side: leverageSide,
				leverage: wei(leverage),
				notionalValue: wei(size).mul(wei(price)),
				minInitialMargin: wei(globals.minInitialMargin),
				status,
				showStatus: status > 0, // 0 is success
				statusMessage: getStatusMessage(status),
			};

			setPotentialTradeDetails(potentialTradeDetails);

			return potentialTradeDetails;
		},
		{
			enabled: isAppReady && isL2 && !!selectedFuturesAddress && !!marketAsset && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPotentialTradeDetails;
