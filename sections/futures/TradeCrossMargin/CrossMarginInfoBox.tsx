import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import InfoBox from 'components/InfoBox';
import { MiniLoader } from 'components/Loader';
import PreviewArrow from 'components/PreviewArrow';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesPotentialTradeDetails } from 'sdk/types/futures';
import {
	selectCrossMarginBalanceInfo,
	selectMarketInfo,
	selectPosition,
	selectTradePreview,
	selectTradePreviewStatus,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import {
	crossMarginMarginDeltaState,
	tradeFeesState,
	futuresTradeInputsState,
	orderTypeState,
	futuresOrderPriceState,
} from 'store/futures';
import { PillButtonSpan } from 'styles/common';
import {
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
	zeroBN,
} from 'utils/formatters/number';

import EditLeverageModal from './EditLeverageModal';
import ManageKeeperBalanceModal from './ManageKeeperBalanceModal';

type Props = {
	editingLeverage?: boolean;
};

function MarginInfoBox({ editingLeverage }: Props) {
	const { selectedLeverage } = useFuturesContext();

	const position = useAppSelector(selectPosition);
	const marketInfo = useAppSelector(selectMarketInfo);
	const { nativeSize } = useRecoilValue(futuresTradeInputsState);
	const potentialTrade = useAppSelector(selectTradePreview);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const { freeMargin: crossMarginFreeMargin, keeperEthBal } = useAppSelector(
		selectCrossMarginBalanceInfo
	);
	const previewStatus = useAppSelector(selectTradePreviewStatus);
	const orderType = useRecoilValue(orderTypeState);
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const { crossMarginFee } = useRecoilValue(tradeFeesState);

	const [openModal, setOpenModal] = useState<'leverage' | 'keeper-deposit' | null>(null);

	const totalMargin = position?.remainingMargin.add(crossMarginFreeMargin) ?? zeroBN;
	const remainingMargin = position?.remainingMargin ?? zeroBN;

	const marginUsage = totalMargin.gt(zeroBN) ? remainingMargin.div(totalMargin) : zeroBN;
	const minInitialMargin = useMemo(() => marketInfo?.minInitialMargin ?? zeroBN, [
		marketInfo?.minInitialMargin,
	]);
	const previewTotalMargin = useMemo(() => {
		const remainingMargin = crossMarginFreeMargin.sub(marginDelta);
		return remainingMargin.add(potentialTrade?.margin || zeroBN);
	}, [crossMarginFreeMargin, marginDelta, potentialTrade?.margin]);

	const getPotentialAvailableMargin = useCallback(
		(previewTrade: FuturesPotentialTradeDetails | null, marketMaxLeverage: Wei | undefined) => {
			let inaccessible;

			if (!marketMaxLeverage) return zeroBN;

			inaccessible = previewTrade?.notionalValue.div(marketMaxLeverage).abs() ?? zeroBN;

			// If the user has a position open, we'll enforce a min initial margin requirement.
			if (inaccessible.gt(0)) {
				if (inaccessible.lt(minInitialMargin)) {
					inaccessible = minInitialMargin;
				}
			}

			// check if available margin will be less than 0
			return previewTotalMargin.sub(inaccessible).gt(0)
				? previewTotalMargin.sub(inaccessible).abs()
				: zeroBN;
		},
		[previewTotalMargin, minInitialMargin]
	);

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(
			potentialTrade,
			marketInfo?.maxLeverage
		);
		return potentialAvailableMargin;
	}, [potentialTrade, marketInfo?.maxLeverage, getPotentialAvailableMargin]);

	const potentialMarginUsage = useMemo(() => {
		if (!potentialTrade) return zeroBN;
		const notionalValue = potentialTrade.notionalValue.abs();
		const maxSize = totalMargin.mul(potentialTrade.leverage);
		return maxSize.gt(0) ? notionalValue.div(maxSize) : zeroBN;
	}, [potentialTrade, totalMargin]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(nativeSize || zeroBN);

		return {
			showPreview:
				((orderType === 'market' || orderType === 'next price') &&
					(!size.eq(0) || !marginDelta.eq(0))) ||
				((orderType === 'limit' || orderType === 'stop market') && !!orderPrice && !size.eq(0)),
			totalMargin: potentialTrade?.margin.sub(crossMarginFee) || zeroBN,
			freeAccountMargin: crossMarginFreeMargin.sub(marginDelta),
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			size: potentialTrade?.size || zeroBN,
			leverage: potentialTrade?.margin.gt(0)
				? potentialTrade.notionalValue.div(potentialTrade.margin).abs()
				: zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [
		nativeSize,
		marginDelta,
		crossMarginFee,
		orderType,
		orderPrice,
		potentialTrade?.margin,
		previewAvailableMargin,
		potentialTrade?.notionalValue,
		potentialTrade?.size,
		crossMarginFreeMargin,
		potentialMarginUsage,
	]);

	const showPreview = previewTradeData.showPreview && !potentialTrade?.showStatus;

	const isLoading = previewStatus === FetchStatus.Loading;
	return (
		<>
			<StyledInfoBox
				dataTestId="market-info-box"
				details={{
					'Free Account Margin': editingLeverage
						? {
								value: formatDollars(crossMarginFreeMargin),
								valueNode: (
									<PreviewArrow
										showPreview={showPreview}
										color={previewTradeData.freeAccountMargin.lt(0) ? 'red' : 'yellow'}
									>
										{isLoading ? <MiniLoader /> : formatDollars(previewTradeData.freeAccountMargin)}
									</PreviewArrow>
								),
						  }
						: null,
					'Market Margin': {
						value: formatDollars(position?.remainingMargin || 0),
						valueNode: (
							<PreviewArrow showPreview={showPreview}>
								{isLoading ? <MiniLoader /> : formatDollars(previewTradeData.totalMargin)}
							</PreviewArrow>
						),
					},
					'Margin Usage': {
						value: formatPercent(marginUsage),
						valueNode: (
							<PreviewArrow showPreview={showPreview}>
								{isLoading ? <MiniLoader /> : formatPercent(previewTradeData?.marginUsage)}
							</PreviewArrow>
						),
					},
					'Account ETH Balance': !editingLeverage
						? {
								value: formatCurrency('ETH', keeperEthBal, { currencyKey: 'ETH' }),
								valueNode: (
									<>
										{keeperEthBal.gt(0) && (
											<PillButtonSpan
												padding={'4px 3px 1px 3px'}
												onClick={() => setOpenModal('keeper-deposit')}
											>
												<WithdrawArrow width="12px" height="9px" />
											</PillButtonSpan>
										)}
									</>
								),
						  }
						: null,
					Leverage: {
						value: (
							<>
								{formatNumber(
									editingLeverage
										? position?.position?.leverage ?? selectedLeverage
										: selectedLeverage,
									{
										maxDecimals: 2,
									}
								)}
								x
								{!editingLeverage && (
									<PillButtonSpan onClick={() => setOpenModal('leverage')}>Edit</PillButtonSpan>
								)}
							</>
						),
						valueNode: (
							<PreviewArrow showPreview={showPreview && !!editingLeverage}>
								{isLoading ? <MiniLoader /> : formatNumber(previewTradeData.leverage || 0) + 'x'}
							</PreviewArrow>
						),
					},
				}}
				disabled={marketInfo?.isSuspended}
			/>

			{openModal === 'leverage' && (
				<EditLeverageModal editMode="next_trade" onDismiss={() => setOpenModal(null)} />
			)}
			{openModal === 'keeper-deposit' && (
				<ManageKeeperBalanceModal defaultType="withdraw" onDismiss={() => setOpenModal(null)} />
			)}
		</>
	);
}

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default React.memo(MarginInfoBox);
