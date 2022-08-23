import Wei, { wei } from '@synthetixio/wei';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { PotentialTradeStatus, POTENTIAL_TRADE_STATUS_TO_MESSAGE } from 'sections/futures/types';
import {
	currentMarketState,
	futuresAccountState,
	leverageSideState,
	potentialTradeDetailsState,
	futuresAccountTypeState,
	tradeSizeState,
} from 'store/futures';
import { isL2State } from 'store/wallet';
import logError from 'utils/logError';

import { FuturesPotentialTradeDetails } from './types';
import useGetCrossMarginPotentialTrade from './useGetCrossMarginTradePreview';
import { getFuturesMarketContract } from './utils';

const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';

const useGetFuturesPotentialTradeDetails = () => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const isL2 = useRecoilValue(isL2State);
	const { synthetixjs } = Connector.useContainer();

	const leverageSide = useRecoilValue(leverageSideState);
	const marketAsset = useRecoilValue(currentMarketState);
	const { leverage } = useRecoilValue(tradeSizeState);

	const getPreview = useGetCrossMarginPotentialTrade(marketAsset, selectedFuturesAddress);

	const [existingPreview, setPotentialTradeDetails] = useRecoilState(potentialTradeDetailsState);

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

	const generatePreview = useCallback(
		async (
			nativeSize: Wei,
			positionMarginDelta: Wei
		): Promise<FuturesPotentialTradeDetails | null> => {
			const newSize = leverageSide === 'long' ? nativeSize : -nativeSize;

			if (
				!synthetixjs ||
				!marketAsset ||
				(!nativeSize && selectedAccountType === 'isolated_margin') ||
				(!nativeSize && (!positionMarginDelta || positionMarginDelta.eq(0))) ||
				!isL2 ||
				!selectedFuturesAddress
			) {
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
				return null;
			}

			if (nativeSize.eq(0)) {
				// Size changed to zero before query completed
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

			return potentialTradeDetails;
		},
		[
			selectedFuturesAddress,
			marketAsset,
			selectedAccountType,
			isL2,
			leverage,
			leverageSide,
			synthetixjs,
			getPreview,
		]
	);

	const getTradeDetails = async (nativeSize: Wei, positionMarginDelta: Wei) => {
		try {
			setPotentialTradeDetails({
				data: existingPreview.data,
				status: 'fetching',
				error: null,
			});
			const data = await generatePreview(nativeSize, positionMarginDelta);
			setPotentialTradeDetails({ data, status: 'complete', error: null });
		} catch (err) {
			logError(err);
			setPotentialTradeDetails({ data: existingPreview.data, status: 'error', error: err.message });
		}
	};

	return getTradeDetails;
};

export default useGetFuturesPotentialTradeDetails;
