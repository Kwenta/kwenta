import Wei, { wei } from '@synthetixio/wei';
import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { FuturesPotentialTradeDetails } from 'queries/futures/types';
import {
	crossMarginAvailableMarginState,
	futuresAccountTypeState,
	leverageSideState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	futuresTradeInputsState,
} from 'store/futures';
import { computeNPFee } from 'utils/costCalculations';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';

import { PositionSide } from '../types';

const MarketInfoBox: React.FC = () => {
	const maxLeverage = useRecoilValue(maxLeverageState);
	const position = useRecoilValue(positionState);
	const marketInfo = useRecoilValue(marketInfoState);
	const orderType = useRecoilValue(orderTypeState);
	const leverageSide = useRecoilValue(leverageSideState);
	const { nativeSize } = useRecoilValue(futuresTradeInputsState);
	const potentialTrade = useRecoilValue(potentialTradeDetailsState);
	const crossMarginFreeMargin = useRecoilValue(crossMarginAvailableMarginState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const totalMargin =
		selectedAccountType === 'cross_margin'
			? position?.remainingMargin.add(crossMarginFreeMargin) ?? zeroBN
			: position?.remainingMargin ?? zeroBN;

	const availableMargin =
		selectedAccountType === 'cross_margin'
			? position?.accessibleMargin.add(crossMarginFreeMargin) ?? zeroBN
			: position?.accessibleMargin ?? zeroBN;

	const buyingPower = totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: zeroBN;

	const isNextPriceOrder = orderType === 1;

	const positionSize = position?.position?.size ? wei(position?.position?.size) : zeroBN;
	const orderDetails = useMemo(() => {
		const newSize =
			leverageSide === PositionSide.LONG ? wei(nativeSize || 0) : wei(nativeSize || 0).neg();
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

	const getPotentialAvailableMargin = (
		trade: FuturesPotentialTradeDetails | null,
		marketMaxLeverage: Wei | undefined
	) => {
		let inaccessible;

		inaccessible =
			(marketMaxLeverage && trade?.notionalValue.div(marketMaxLeverage).abs()) ?? zeroBN;

		// If the user has a position open, we'll enforce a min initial margin requirement.
		if (inaccessible.gt(0)) {
			if (inaccessible.lt(trade?.minInitialMargin ?? zeroBN)) {
				inaccessible = trade?.minInitialMargin ?? zeroBN;
			}
		}

		// check if available margin will be less than 0
		return trade?.margin?.sub(inaccessible).gt(0) ? trade?.margin?.sub(inaccessible).abs() : zeroBN;
	};

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(
			potentialTrade.data,
			marketInfo?.maxLeverage
		);
		return isNextPriceOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [potentialTrade.data, marketInfo?.maxLeverage, isNextPriceOrder, totalDeposit]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(nativeSize || zeroBN);

		const potentialMarginUsage = potentialTrade.data?.margin.gt(0)
			? potentialTrade.data?.margin
					?.sub(previewAvailableMargin)
					?.div(potentialTrade.data?.margin)
					?.abs() ?? zeroBN
			: zeroBN;

		const potentialBuyingPower =
			previewAvailableMargin?.mul(maxLeverage ?? zeroBN)?.abs() ?? zeroBN;

		return {
			showPreview: size && !size.eq(0),
			totalMargin: potentialTrade.data?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [nativeSize, potentialTrade.data?.margin, previewAvailableMargin, maxLeverage]);

	return (
		<StyledInfoBox
			dataTestId="market-info-box"
			details={{
				'Total Margin': {
					value: `${formatCurrency('sUSD', totalMargin, {
						currencyKey: 'sUSD',
						sign: '$',
					})}`,
				},
				'Available Margin': {
					value: `${formatCurrency('sUSD', availableMargin, {
						currencyKey: undefined,
						sign: '$',
					})}`,
					valueNode: (
						<PreviewArrow
							showPreview={previewTradeData.showPreview && !potentialTrade.data?.showStatus}
						>
							{formatCurrency('sUSD', previewTradeData?.availableMargin, {
								sign: '$',
							})}
						</PreviewArrow>
					),
				},
				'Buying Power': {
					value: `${formatCurrency('sUSD', buyingPower, {
						currencyKey: undefined,
						sign: '$',
					})}`,
					valueNode: previewTradeData?.buyingPower && (
						<PreviewArrow
							showPreview={previewTradeData.showPreview && !potentialTrade.data?.showStatus}
						>
							{formatCurrency('sUSD', previewTradeData?.buyingPower, {
								sign: '$',
							})}
						</PreviewArrow>
					),
				},
				'Margin Usage': {
					value: `${formatPercent(marginUsage)}`,
					valueNode: (
						<PreviewArrow
							showPreview={previewTradeData.showPreview && !potentialTrade.data?.showStatus}
						>
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
