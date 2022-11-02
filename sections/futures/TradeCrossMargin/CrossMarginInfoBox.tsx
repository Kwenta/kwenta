import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled, { useTheme } from 'styled-components';

import WithdrawArrow from 'assets/svg/futures/withdraw-arrow.svg';
import InfoBox from 'components/InfoBox';
import { MiniLoader } from 'components/Loader';
import PreviewArrow from 'components/PreviewArrow';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesPotentialTradeDetails } from 'queries/futures/types';
import {
	crossMarginMarginDeltaState,
	marketInfoState,
	positionState,
	potentialTradeDetailsState,
	tradeFeesState,
	futuresTradeInputsState,
	orderTypeState,
	futuresOrderPriceState,
	crossMarginAccountOverviewState,
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
	const { colors } = useTheme();

	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const { nativeSize } = useRecoilValue(futuresTradeInputsState);
	const potentialTrade = useRecoilValue(potentialTradeDetailsState);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const { freeMargin: crossMarginFreeMargin, keeperEthBal } = useRecoilValue(
		crossMarginAccountOverviewState
	);
	const orderType = useRecoilValue(orderTypeState);
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const { crossMarginFee } = useRecoilValue(tradeFeesState);

	const [openModal, setOpenModal] = useState<'leverage' | 'keeper-deposit' | null>(null);

	const totalMargin = position?.remainingMargin.add(crossMarginFreeMargin) ?? zeroBN;
	const availableMargin = position?.accessibleMargin.add(crossMarginFreeMargin) ?? zeroBN;
	const currentSize = position?.position?.size ?? zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: zeroBN;

	const previewTotalMargin = useMemo(() => {
		const remainingMargin = crossMarginFreeMargin.sub(marginDelta);
		return remainingMargin.add(potentialTrade.data?.margin || zeroBN);
	}, [crossMarginFreeMargin, marginDelta, potentialTrade.data?.margin]);

	const getPotentialAvailableMargin = useCallback(
		(previewTrade: FuturesPotentialTradeDetails | null, marketMaxLeverage: Wei | undefined) => {
			let inaccessible;

			inaccessible = previewTrade?.notionalValue.div(marketMaxLeverage).abs() ?? zeroBN;

			// If the user has a position open, we'll enforce a min initial margin requirement.
			if (inaccessible.gt(0)) {
				if (inaccessible.lt(previewTrade?.minInitialMargin ?? zeroBN)) {
					inaccessible = previewTrade?.minInitialMargin ?? zeroBN;
				}
			}

			// check if available margin will be less than 0
			return previewTotalMargin.sub(inaccessible).gt(0)
				? previewTotalMargin.sub(inaccessible).abs()
				: zeroBN;
		},
		[previewTotalMargin]
	);

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(
			potentialTrade.data,
			marketInfo?.maxLeverage
		);
		return potentialAvailableMargin;
	}, [potentialTrade.data, marketInfo?.maxLeverage, getPotentialAvailableMargin]);

	const potentialMarginUsage = useMemo(() => {
		if (!potentialTrade.data) return zeroBN;
		const notionalValue = potentialTrade.data.notionalValue.abs();
		const maxSize = totalMargin.mul(potentialTrade.data.leverage);
		return maxSize.gt(0) ? notionalValue.div(maxSize) : zeroBN;
	}, [potentialTrade.data, totalMargin]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(nativeSize || zeroBN);

		return {
			showPreview:
				((orderType === 'market' || orderType === 'next price') &&
					(!size.eq(0) || !marginDelta.eq(0))) ||
				((orderType === 'limit' || orderType === 'stop market') && !!orderPrice && !size.eq(0)),
			totalMargin: potentialTrade.data?.margin.sub(crossMarginFee) || zeroBN,
			freeAccountMargin: crossMarginFreeMargin.sub(marginDelta),
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			size: potentialTrade.data?.size || zeroBN,
			leverage: potentialTrade.data?.margin.gt(0)
				? potentialTrade.data.notionalValue.div(potentialTrade.data.margin).abs()
				: zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [
		nativeSize,
		marginDelta,
		crossMarginFee,
		orderType,
		orderPrice,
		potentialTrade.data?.margin,
		previewAvailableMargin,
		potentialTrade.data?.notionalValue,
		potentialTrade.data?.size,
		crossMarginFreeMargin,
		potentialMarginUsage,
	]);

	const showPreview = previewTradeData.showPreview && !potentialTrade.data?.showStatus;

	return (
		<>
			<StyledInfoBox
				dataTestId="market-info-box"
				details={{
					'Market Margin': !editingLeverage
						? {
								value: formatDollars(position?.remainingMargin || 0),
								valueNode: (
									<PreviewArrow showPreview={showPreview}>
										{potentialTrade.status === 'fetching' ? (
											<MiniLoader />
										) : (
											formatDollars(previewTradeData.totalMargin)
										)}
									</PreviewArrow>
								),
						  }
						: null,
					'Margin Usage': {
						value: formatPercent(marginUsage),
						valueNode: (
							<PreviewArrow showPreview={showPreview}>
								{potentialTrade.status === 'fetching' ? (
									<MiniLoader />
								) : (
									formatPercent(previewTradeData?.marginUsage)
								)}
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
												<WithdrawArrow
													width="12px"
													height="9px"
													stroke={colors.selectedTheme.yellow}
												/>
											</PillButtonSpan>
										)}
									</>
								),
						  }
						: null,
					Leverage: {
						value: (
							<>
								{formatNumber(selectedLeverage, { maxDecimals: 2 })}x
								{!editingLeverage && (
									<PillButtonSpan onClick={() => setOpenModal('leverage')}>Edit</PillButtonSpan>
								)}
							</>
						),
						valueNode: (
							<PreviewArrow showPreview={showPreview && !!editingLeverage}>
								{potentialTrade.status === 'fetching' ? (
									<MiniLoader />
								) : (
									formatNumber(previewTradeData.leverage || 0) + 'x'
								)}
							</PreviewArrow>
						),
					},
					'Position Size': editingLeverage
						? {
								value: formatCurrency(marketInfo?.asset || '', currentSize),
								valueNode: (
									<PreviewArrow showPreview={showPreview}>
										{potentialTrade.status === 'fetching' ? (
											<MiniLoader />
										) : (
											formatCurrency(marketInfo?.asset || '', previewTradeData.size)
										)}
									</PreviewArrow>
								),
						  }
						: null,
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
