import React, { useMemo } from 'react';
import styled from 'styled-components';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { useRecoilValue } from 'recoil';
import {
	leverageSideState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	tradeSizeState,
} from 'store/futures';
import Wei, { wei } from '@synthetixio/wei';
import { Synths } from 'constants/currency';
import { PositionSide } from '../types';
import PreviewArrow from 'components/PreviewArrow';
import { FuturesPotentialTradeDetails } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import { computeNPFee } from 'utils/costCalculations';

const MarketInfoBox: React.FC = () => {
	const maxLeverage = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const orderType = useRecoilValue(orderTypeState);
	const leverageSide = useRecoilValue(leverageSideState);
	const tradeSize = useRecoilValue(tradeSizeState);

	const totalMargin = position?.remainingMargin ?? zeroBN;
	const availableMargin = position?.accessibleMargin ?? zeroBN;

	const buyingPower =
		position && position?.accessibleMargin.gt(zeroBN)
			? position?.accessibleMargin?.mul(maxLeverage ?? zeroBN)
			: zeroBN;

	const marginUsage =
		position && position?.remainingMargin.gt(zeroBN)
			? position?.remainingMargin?.sub(position?.accessibleMargin).div(position?.remainingMargin)
			: zeroBN;

	const previewTrade = useRecoilValue(potentialTradeDetailsState);

	const isNextPriceOrder = orderType === 1;
	const nextPriceDetailsQuery = useGetNextPriceDetails();
	const nextPriceDetails = nextPriceDetailsQuery?.data;

	const positionSize = position?.position?.size ? wei(position?.position?.size) : zeroBN;
	const orderDetails = useMemo(() => {
		const newSize =
			leverageSide === PositionSide.LONG ? wei(tradeSize || 0) : wei(tradeSize || 0).neg();
		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leverageSide, positionSize]);

	const { commitDeposit } = useMemo(
		() => computeNPFee(nextPriceDetails, wei(orderDetails.newSize)),
		[nextPriceDetails, orderDetails]
	);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(nextPriceDetails?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceDetails?.keeperDeposit]);

	const getPotentialAvailableMargin = (
		previewTrade: FuturesPotentialTradeDetails | null,
		marketMaxLeverage: Wei | undefined
	) => {
		let inaccessible;

		inaccessible = previewTrade?.notionalValue.div(marketMaxLeverage).abs() ?? zeroBN;

		// If the user has a position open, we'll enforce a min initial margin requirement.
		if (inaccessible.gt(0)) {
			if (inaccessible.lt(previewTrade?.minInitialMargin ?? zeroBN)) {
				inaccessible = previewTrade?.minInitialMargin ?? zeroBN;
			}
		}

		// check if available margin will be less than 0
		return previewTrade?.margin?.sub(inaccessible).gt(0)
			? previewTrade?.margin?.sub(inaccessible).abs()
			: zeroBN;
	};

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(previewTrade, maxLeverage);
		return isNextPriceOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [previewTrade, maxLeverage, isNextPriceOrder, totalDeposit]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(tradeSize || zeroBN);
		const potentialMarginUsage = previewTrade?.margin.gt(0)
			? previewTrade?.margin?.sub(previewAvailableMargin)?.div(previewTrade?.margin)?.abs() ??
			  zeroBN
			: zeroBN;
		const potentialBuyingPower =
			previewAvailableMargin?.mul(maxLeverage ?? zeroBN)?.abs() ?? zeroBN;

		return {
			showPreview: size && !size.eq(0),
			totalMargin: previewTrade?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [tradeSize, previewTrade?.margin, previewAvailableMargin, maxLeverage]);

	return (
		<StyledInfoBox
			details={{
				'Total Margin': {
					value: `${formatCurrency(Synths.sUSD, totalMargin, {
						currencyKey: Synths.sUSD,
						sign: '$',
					})}`,
				},
				'Available Margin': {
					value: `${formatCurrency(Synths.sUSD, availableMargin, {
						currencyKey: undefined,
						sign: '$',
					})}`,
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
							{formatCurrency(Synths.sUSD, previewTradeData?.availableMargin, {
								sign: '$',
							})}
						</PreviewArrow>
					),
				},
				'Buying Power': {
					value: `${formatCurrency(Synths.sUSD, buyingPower, {
						currencyKey: undefined,
						sign: '$',
					})}`,
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
			}}
			disabled={marketInfo?.isSuspended}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default MarketInfoBox;
