import { wei } from '@synthetixio/wei';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { PotentialTradeStatus, POTENTIAL_TRADE_STATUS_TO_MESSAGE } from 'sections/futures/types';
import { appReadyState } from 'store/app';
import {
	crossMarginMarginDeltaState,
	currentMarketState,
	futuresAccountState,
	leverageSideState,
	isolatedMarginleverageState,
	potentialTradeDetailsState,
	tradeSizeState,
	futuresAccountTypeState,
} from 'store/futures';
import { isL2State, networkState } from 'store/wallet';

import { FuturesPotentialTradeDetails } from './types';
import useGetCrossMarginPotentialTrade from './useGetCrossMarginTradePreview';
import { getFuturesMarketContract } from './utils';

const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';

const useGetFuturesPotentialTradeDetails = (
	options?: UseQueryOptions<FuturesPotentialTradeDetails | null>
) => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const { synthetixjs } = Connector.useContainer();

	const tradeSize = useRecoilValue(tradeSizeState);

	const leverageSide = useRecoilValue(leverageSideState);
	const leverage = useRecoilValue(isolatedMarginleverageState);
	const marketAsset = useRecoilValue(currentMarketState);
	const positionMarginDelta = useRecoilValue(crossMarginMarginDeltaState);

	const newSize = leverageSide === 'long' ? tradeSize : -tradeSize;

	const getPreview = useGetCrossMarginPotentialTrade(marketAsset, selectedFuturesAddress);

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
			selectedFuturesAddress || '',
			selectedAccountType,
			positionMarginDelta.toString(),
			leverageSide
		),
		async () => {
			if (
				!marketAsset ||
				(!tradeSize && selectedAccountType === 'isolated_margin') ||
				!isL2 ||
				!selectedFuturesAddress
			) {
				setPotentialTradeDetails(null);
				return null;
			}

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);

			const globals = await FuturesMarketData.globals();
			const preview =
				selectedAccountType === 'cross_margin'
					? await getPreview(newSize, wei(positionMarginDelta).toBN())
					: await FuturesMarketContract.postTradeDetails(
							wei(newSize).toBN(),
							selectedFuturesAddress
					  );

			if (!preview) {
				setPotentialTradeDetails(null);
				return null;
			}

			const { fee, liqPrice, margin, price, size, status } = preview;

			const potentialTradeDetails = {
				fee: wei(fee),
				liqPrice: wei(liqPrice),
				margin: wei(margin),
				price: wei(price),
				size: wei(size),
				side: leverageSide,
				leverage: wei(leverage !== '' ? leverage : 1),
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
			enabled: isAppReady && isL2 && !!marketAsset && !!synthetixjs,
			...options,
		}
	);
};

export default useGetFuturesPotentialTradeDetails;
