import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { PositionSide } from 'sdk/types/futures';
import {
	selectDelayedOrderFee,
	selectMarketInfo,
	selectMaxLeverage,
	selectOrderType,
	selectPosition,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const MarketInfoBox: React.FC = () => {
	const orderType = useAppSelector(selectOrderType);
	const potentialTrade = useAppSelector(selectTradePreview);

	const marketInfo = useAppSelector(selectMarketInfo);
	const position = useAppSelector(selectPosition);
	const maxLeverage = useAppSelector(selectMaxLeverage);
	const { commitDeposit } = useAppSelector(selectDelayedOrderFee);

	const minInitialMargin = useMemo(() => marketInfo?.minInitialMargin ?? zeroBN, [
		marketInfo?.minInitialMargin,
	]);

	const totalMargin = position?.remainingMargin ?? zeroBN;

	// function for calculating available margin
	const getAvailableMargin = useCallback(
		(notionalValue: Wei, margin: Wei, marketMaxLeverage: Wei) => {
			let inaccessible = notionalValue.div(marketMaxLeverage).abs() ?? zeroBN;

			// If the user has a position open, we'll enforce a min initial margin requirement.
			if (inaccessible.gt(0) && inaccessible.lt(minInitialMargin)) {
				inaccessible = minInitialMargin;
			}

			// check if available margin will be less than 0
			return margin.sub(inaccessible).gt(0) ? margin.sub(inaccessible).abs() : zeroBN;
		},
		[minInitialMargin]
	);

	// adjust accessible margin due to frontend soft cap on leverage
	const availableMargin = useMemo(() => {
		if (!position?.position || !marketInfo) return zeroBN;
		return getAvailableMargin(position.position.notionalValue, totalMargin, marketInfo.maxLeverage);
	}, [position?.position, marketInfo, totalMargin, getAvailableMargin]);

	const buyingPower = totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: totalMargin.gt(zeroBN)
		? wei(1)
		: zeroBN;

	const isDelayedOrder = useMemo(() => orderType === 'delayed', [orderType]);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const previewAvailableMargin = useMemo(() => {
		const potentialAvailableMargin =
			!!potentialTrade && !!marketInfo
				? getAvailableMargin(
						potentialTrade.notionalValue,
						potentialTrade.margin,
						marketInfo.maxLeverage
				  )
				: zeroBN;

		return isDelayedOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [potentialTrade, marketInfo, isDelayedOrder, totalDeposit, getAvailableMargin]);

	const previewTradeData = useMemo(() => {
		const potentialMarginUsage = potentialTrade?.margin.gt(0)
			? potentialTrade!.margin.sub(previewAvailableMargin).div(potentialTrade!.margin).abs() ??
			  zeroBN
			: zeroBN;

		const maxPositionSize =
			!!potentialTrade && !!marketInfo
				? potentialTrade.margin
						.mul(marketInfo.maxLeverage)
						.mul(potentialTrade.side === PositionSide.LONG ? 1 : -1)
				: null;

		const potentialBuyingPower = !!maxPositionSize
			? maxPositionSize.sub(potentialTrade?.notionalValue).abs()
			: zeroBN;

		return {
			showPreview: !!potentialTrade && potentialTrade.sizeDelta.abs().gt(0),
			totalMargin: potentialTrade?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [potentialTrade, previewAvailableMargin, marketInfo]);

	return (
		<StyledInfoBox
			dataTestId="market-info-box"
			details={{
				'Available Margin': {
					value: formatDollars(availableMargin, { currencyKey: undefined }),
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
							{formatDollars(previewTradeData?.availableMargin)}
						</PreviewArrow>
					),
				},
				'Buying Power': {
					value: formatDollars(buyingPower, { currencyKey: undefined }),
					valueNode: previewTradeData?.buyingPower && (
						<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
							{formatDollars(previewTradeData?.buyingPower)}
						</PreviewArrow>
					),
				},
				'Margin Usage': {
					value: formatPercent(marginUsage),
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
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
