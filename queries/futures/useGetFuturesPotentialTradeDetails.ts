import Wei, { wei } from '@synthetixio/wei';
import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { PotentialTradeStatus, POTENTIAL_TRADE_STATUS_TO_MESSAGE } from 'sections/futures/types';
import { selectCrossMarginBalanceInfo, selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	leverageSideState,
	potentialTradeDetailsState,
	futuresAccountTypeState,
	selectedFuturesAddressState,
	orderTypeState,
} from 'store/futures';
import logError from 'utils/logError';

import { FuturesPotentialTradeDetails } from './types';
import useGetCrossMarginPotentialTrade from './useGetCrossMarginTradePreview';
import { getFuturesMarketContract } from './utils';

const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';

const useGetFuturesPotentialTradeDetails = () => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const selectedFuturesAddress = useRecoilValue(selectedFuturesAddressState);
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();
	const isL2 = useIsL2();

	const leverageSide = useRecoilValue(leverageSideState);
	const marketAsset = useAppSelector(selectMarketAsset);

	const orderType = useRecoilValue(orderTypeState);
	const { freeMargin } = useAppSelector(selectCrossMarginBalanceInfo);
	const setPotentialTradeDetails = useSetRecoilState(potentialTradeDetailsState);

	const getPreview = useGetCrossMarginPotentialTrade(marketAsset, selectedFuturesAddress);

	const generatePreview = useCallback(
		async (
			nativeSizeDelta: Wei,
			positionMarginDelta: Wei,
			leverage: number,
			orderPrice?: Wei
		): Promise<FuturesPotentialTradeDetails | null> => {
			if (
				!synthetixjs ||
				!marketAsset ||
				(!nativeSizeDelta && selectedAccountType === 'isolated_margin') ||
				(!nativeSizeDelta && (!positionMarginDelta || positionMarginDelta.eq(0))) ||
				((orderType === 'limit' || orderType === 'stop market') && orderPrice?.eq(0)) ||
				!isL2 ||
				!selectedFuturesAddress
			) {
				return null;
			}

			if (positionMarginDelta.gt(freeMargin)) {
				throw new Error('insufficient_margin');
			}

			const {
				contracts: { FuturesMarketData },
			} = synthetixjs!;

			const FuturesMarketContract = getFuturesMarketContract(marketAsset, synthetixjs!.contracts);

			const globals = await FuturesMarketData.globals();
			const preview =
				selectedAccountType === 'cross_margin'
					? await getPreview(
							nativeSizeDelta.toBN(),
							wei(positionMarginDelta).toBN(),
							orderPrice ? wei(orderPrice).toBN() : undefined
					  )
					: await FuturesMarketContract.postTradeDetails(
							wei(nativeSizeDelta).toBN(),
							selectedFuturesAddress
					  );

			if (!preview) {
				return null;
			}

			if (nativeSizeDelta.eq(0) && positionMarginDelta.eq(0)) {
				// Size and margin changed to zero before query completed
				return null;
			}

			const { fee, liqPrice, margin, price, size, status } = preview;

			const potentialTradeDetails = {
				fee: wei(fee),
				liqPrice: wei(liqPrice),
				margin: wei(margin),
				price: wei(price),
				size: wei(size),
				sizeDelta: nativeSizeDelta,
				side: leverageSide,
				leverage: wei(leverage ? leverage : 1),
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
			leverageSide,
			synthetixjs,
			orderType,
			freeMargin,
			getPreview,
		]
	);

	const getTradeDetails = useCallback(
		async (nativeSize: Wei, positionMarginDelta: Wei, leverage: number, orderPrice?: Wei) => {
			try {
				setPotentialTradeDetails({
					data: null,
					status: 'fetching',
					error: null,
				});
				const data = await generatePreview(nativeSize, positionMarginDelta, leverage, orderPrice);
				setPotentialTradeDetails({ data, status: 'complete', error: null });
			} catch (err) {
				logError(err);
				setPotentialTradeDetails({
					data: null,
					status: 'error',
					error: err.message,
				});
			}
		},
		[setPotentialTradeDetails, generatePreview]
	);

	return getTradeDetails;
};

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

export default useGetFuturesPotentialTradeDetails;
