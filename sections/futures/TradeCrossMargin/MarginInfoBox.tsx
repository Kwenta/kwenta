import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import DepositWithdrawIcon from 'assets/svg/futures/deposit-withdraw-arrows.svg';
import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { Synths } from 'constants/currency';
import { useFuturesContext } from 'contexts/FuturesContext';
import { FuturesPotentialTradeDetails } from 'queries/futures/types';
import {
	crossMarginAvailableMarginState,
	crossMarginMarginDeltaState,
	leverageSideState,
	marketInfoState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	tradeSizeState,
} from 'store/futures';
import { computeNPFee } from 'utils/costCalculations';
import {
	formatCurrency,
	formatDollars,
	formatNumber,
	formatPercent,
	zeroBN,
} from 'utils/formatters/number';

import { PositionSide } from '../types';
import DepositWithdrawCrossMargin from './DepositWithdrawCrossMargin';
import EditLeverageModal from './EditLeverageModal';

const MarginInfoBox: React.FC = () => {
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const orderType = useRecoilValue(orderTypeState);
	const leverageSide = useRecoilValue(leverageSideState);
	const tradeSize = useRecoilValue(tradeSizeState);
	const previewTrade = useRecoilValue(potentialTradeDetailsState);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const crossMarginFreeMargin = useRecoilValue(crossMarginAvailableMarginState);
	const [openModal, setOpenModal] = useState<'leverage' | 'deposit' | null>(null);

	const { selectedLeverage } = useFuturesContext();

	const totalMargin = position?.remainingMargin.add(crossMarginFreeMargin) ?? zeroBN;

	const availableMargin = position?.accessibleMargin.add(crossMarginFreeMargin) ?? zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: zeroBN;

	const isNextPriceOrder = orderType === 1;

	const positionSize = position?.position?.size ? wei(position?.position?.size) : zeroBN;
	const orderDetails = useMemo(() => {
		const newSize =
			leverageSide === PositionSide.LONG ? wei(tradeSize || 0) : wei(tradeSize || 0).neg();
		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leverageSide, positionSize]);

	const { commitDeposit } = useMemo(() => computeNPFee(marketInfo, wei(orderDetails.newSize)), [
		marketInfo,
		orderDetails,
	]);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

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

			const remainingMargin = crossMarginFreeMargin.sub(marginDelta);
			const previewTotalMargin = remainingMargin.add(previewTrade?.margin || zeroBN);

			// check if available margin will be less than 0
			return previewTotalMargin.sub(inaccessible).gt(0)
				? previewTotalMargin.sub(inaccessible).abs()
				: zeroBN;
		},
		[crossMarginFreeMargin, marginDelta]
	);

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(
			previewTrade,
			marketInfo?.maxLeverage
		);

		return isNextPriceOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [
		previewTrade,
		marketInfo?.maxLeverage,
		isNextPriceOrder,
		totalDeposit,
		getPotentialAvailableMargin,
	]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(tradeSize || zeroBN);

		// TODO: Potential margin usage is slightly off (maybe fees)?
		const potentialMarginUsage = previewTrade?.margin.gt(0)
			? previewTrade?.margin?.sub(previewAvailableMargin)?.div(previewTrade?.margin)?.abs() ??
			  zeroBN
			: zeroBN;

		return {
			showPreview: !size.eq(0) || !marginDelta.eq(0),
			totalMargin: previewTrade?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			leverage: previewTrade?.leverage,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [
		tradeSize,
		marginDelta,
		previewTrade?.margin,
		previewAvailableMargin,
		previewTrade?.leverage,
	]);

	return (
		<>
			<StyledInfoBox
				dataTestId="market-info-box"
				details={{
					'Total Margin': {
						value: formatCurrency(Synths.sUSD, totalMargin, {
							currencyKey: Synths.sUSD,
							sign: '$',
						}),
					},
					'Free Account Margin': {
						value: (
							<Row>
								{formatDollars(crossMarginFreeMargin)}
								<HoverDiv>
									<DepositWithdrawButton onClick={() => setOpenModal('deposit')} />
								</HoverDiv>
							</Row>
						),
					},
					'Market Margin': {
						value: `${formatDollars(position?.remainingMargin)}`,
						valueNode: (
							<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
								{formatDollars(previewTradeData.totalMargin)}
							</PreviewArrow>
						),
					},
					// 'Free market Margin': {
					// 	value: `${formatDollars(position?.accessibleMargin)}`,
					// 	valueNode: (
					// 		<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
					// 			{formatDollars(previewTradeData.availableMargin)}
					// 		</PreviewArrow>
					// 	),
					// },
					'Margin Usage': {
						value: `${formatPercent(marginUsage)}`,
						valueNode: (
							<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
								{formatPercent(previewTradeData?.marginUsage)}
							</PreviewArrow>
						),
					},
					Leverage: {
						value: (
							<Row>
								{formatNumber(selectedLeverage, { maxDecimals: 2 })}x
								<EditButton onClick={() => setOpenModal('leverage')}>Edit</EditButton>
							</Row>
						),
					},
				}}
				disabled={marketInfo?.isSuspended}
			/>
			{openModal === 'deposit' && (
				<DepositWithdrawCrossMargin onDismiss={() => setOpenModal(null)} />
			)}
			{openModal === 'leverage' && <EditLeverageModal onDismiss={() => setOpenModal(null)} />}
		</>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

const Row = styled.div`
	display: flex;
`;

const HoverDiv = styled.div`
	transition: all 0.1s ease-in-out;
	&:hover {
		opacity: 0.7;
	}
`;

const DepositWithdrawButton = styled(DepositWithdrawIcon)`
	margin-left: 10px;
	cursor: pointer;
`;

const EditButton = styled(HoverDiv)`
	margin-left: 8px;
	cursor: pointer;
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
`;

export default MarginInfoBox;
