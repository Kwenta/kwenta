import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { FuturesPotentialTradeDetails } from 'sdk/types/futures';
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

	const totalMargin = position?.remainingMargin ?? zeroBN;
	const availableMargin = position?.accessibleMargin ?? zeroBN;

	const buyingPower = totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: zeroBN;

	const minInitialMargin = useMemo(() => marketInfo?.minInitialMargin ?? zeroBN, [
		marketInfo?.minInitialMargin,
	]);

	const isDelayedOrder = useMemo(() => orderType === 'delayed', [orderType]);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const getPotentialAvailableMargin = useCallback(
		(trade: FuturesPotentialTradeDetails | null, marketMaxLeverage?: Wei) => {
			let inaccessible =
				(marketMaxLeverage && trade?.notionalValue.div(marketMaxLeverage).abs()) ?? zeroBN;

			// If the user has a position open, we'll enforce a min initial margin requirement.
			if (inaccessible.gt(0) && inaccessible.lt(minInitialMargin)) {
				inaccessible = minInitialMargin;
			}

			// check if available margin will be less than 0
			return trade?.margin?.sub(inaccessible).gt(0)
				? trade?.margin?.sub(inaccessible).abs()
				: zeroBN;
		},
		[minInitialMargin]
	);

	const previewAvailableMargin = React.useMemo(() => {
		const potentialAvailableMargin = getPotentialAvailableMargin(
			potentialTrade,
			marketInfo?.maxLeverage
		);
		return isDelayedOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [
		potentialTrade,
		marketInfo?.maxLeverage,
		isDelayedOrder,
		totalDeposit,
		getPotentialAvailableMargin,
	]);

	const previewTradeData = React.useMemo(() => {
		const potentialMarginUsage = potentialTrade?.margin.gt(0)
			? potentialTrade!.margin.sub(previewAvailableMargin).div(potentialTrade!.margin).abs() ??
			  zeroBN
			: zeroBN;

		const potentialBuyingPower =
			previewAvailableMargin?.mul(maxLeverage ?? zeroBN)?.abs() ?? zeroBN;

		return {
			// TODO: Re-enable this, disabling because the preview margin looks incorrect
			// showPreview: size && !size.eq(0) && !!potentialTrade,
			showPreview: false,
			totalMargin: potentialTrade?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [potentialTrade, previewAvailableMargin, maxLeverage]);

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
