import { wei } from '@synthetixio/wei';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { PositionSide } from 'sdk/types/futures';
import {
	selectAvailableMargin,
	selectMarketInfo,
	selectMaxLeverage,
	selectPosition,
	selectPreviewAvailableMargin,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const MarketInfoBox: React.FC = () => {
	const potentialTrade = useAppSelector(selectTradePreview);

	const marketInfo = useAppSelector(selectMarketInfo);
	const position = useAppSelector(selectPosition);
	const maxLeverage = useAppSelector(selectMaxLeverage);
	const availableMargin = useAppSelector(selectAvailableMargin);
	const previewAvailableMargin = useAppSelector(selectPreviewAvailableMargin);

	const totalMargin = position?.remainingMargin ?? zeroBN;
	const buyingPower = totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;

	const marginUsage = useMemo(
		() =>
			availableMargin.gt(zeroBN)
				? totalMargin.sub(availableMargin).div(totalMargin)
				: totalMargin.gt(zeroBN)
				? wei(1)
				: zeroBN,
		[availableMargin, totalMargin]
	);

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
