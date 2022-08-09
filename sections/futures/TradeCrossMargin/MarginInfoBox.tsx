import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import DepositWithdrawIcon from 'assets/svg/futures/deposit-withdraw-arrows.svg';
import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { Synths } from 'constants/currency';
import { FuturesPotentialTradeDetails } from 'queries/futures/types';
import {
	crossMarginAvailableMarginState,
	crossMarginLeverageState,
	crossMarginMarginDeltaState,
	leverageSideState,
	marketInfoState,
	maxLeverageState,
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

const MarginInfoBox: React.FC = () => {
	const maxLeverage = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const orderType = useRecoilValue(orderTypeState);
	const leverageSide = useRecoilValue(leverageSideState);
	const selectedLeverage = useRecoilValue(crossMarginLeverageState);
	const tradeSize = useRecoilValue(tradeSizeState);
	const previewTrade = useRecoilValue(potentialTradeDetailsState);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const crossMarginFreeMargin = useRecoilValue(crossMarginAvailableMarginState);
	const [openModal, setOpenModal] = useState<string | null>(null);

	const totalMargin = position?.remainingMargin.add(crossMarginFreeMargin) ?? zeroBN;

	const availableMargin = position?.accessibleMargin.add(crossMarginFreeMargin) ?? zeroBN;

	const buyingPower = totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;

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

		const potentialMarginUsage = previewTrade?.margin.gt(0)
			? previewTrade?.margin.sub(previewAvailableMargin)?.div(previewTrade?.margin)?.abs() ?? zeroBN
			: zeroBN;

		const potentialBuyingPower =
			previewAvailableMargin?.mul(maxLeverage ?? zeroBN)?.abs() ?? zeroBN;

		return {
			showPreview: size && !size.eq(0),
			totalMargin: previewTrade?.margin || zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			leverage: previewTrade?.leverage,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [
		tradeSize,
		previewTrade?.margin,
		previewAvailableMargin,
		maxLeverage,
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
					'Available Account Margin': {
						value: (
							<AccountMarginRow>
								{formatDollars(crossMarginFreeMargin)}
								<DepositWithdrawButton onClick={() => setOpenModal('deposit')} />
							</AccountMarginRow>
						),
					},
					'Market Margin': {
						value: `${formatDollars(position?.remainingMargin)}`,
						valueNode: ` (${formatNumber(marginDelta)})`,
					},
					'accessible market Margin': {
						value: `${formatDollars(position?.accessibleMargin)}`,
					},
					'Buying Power': {
						value: `${formatDollars(buyingPower)}`,
						valueNode: previewTradeData?.buyingPower && (
							<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
								{formatCurrency(Synths.sUSD, previewTradeData?.buyingPower, {
									sign: '$',
								})}
							</PreviewArrow>
						),
					},
					'Margin Usage': {
						value: `${formatPercent(marginUsage)}`,
						valueNode: (
							<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
								{formatPercent(previewTradeData?.marginUsage)}
							</PreviewArrow>
						),
					},
					Leverage: {
						value: position?.position?.leverage
							? `${formatNumber(position.position.leverage)}x`
							: `${formatNumber(selectedLeverage)}x`,
						valueNode: position?.position?.leverage ? (
							<PreviewArrow showPreview>{formatNumber(selectedLeverage)}x</PreviewArrow>
						) : null,
					},
				}}
				disabled={marketInfo?.isSuspended}
			/>
			{openModal === 'deposit' && (
				<DepositWithdrawCrossMargin onDismiss={() => setOpenModal(null)} />
			)}
		</>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

const AccountMarginRow = styled.div`
	display: flex;
`;

const DepositWithdrawButton = styled(DepositWithdrawIcon)`
	margin-left: 10px;
	cursor: pointer;
`;

export default MarginInfoBox;
