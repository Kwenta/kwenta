import Wei, { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { FuturesPotentialTradeDetails } from 'sdk/types/futures';
import {
	selectLeverageSide,
	selectMarketInfo,
	selectMaxLeverage,
	selectPosition,
	selectTradePreview,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { orderTypeState } from 'store/futures';
import { computeDelayedOrderFee } from 'utils/costCalculations';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';

const MarketInfoBox: React.FC = () => {
	const orderType = useRecoilValue(orderTypeState);
	const leverageSide = useAppSelector(selectLeverageSide);
	const { nativeSizeWei, nativeSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const potentialTrade = useAppSelector(selectTradePreview);

	const marketInfo = useAppSelector(selectMarketInfo);
	const position = useAppSelector(selectPosition);
	const maxLeverage = useAppSelector(selectMaxLeverage);

	const totalMargin = position?.remainingMargin ?? zeroBN;
	const availableMargin = position?.accessibleMargin ?? zeroBN;

	const buyingPower = totalMargin.gt(zeroBN) ? totalMargin.mul(maxLeverage ?? zeroBN) : zeroBN;

	const marginUsage = availableMargin.gt(zeroBN)
		? totalMargin.sub(availableMargin).div(totalMargin)
		: zeroBN;

	const minInitialMargin = useMemo(() => marketInfo?.minInitialMargin ?? zeroBN, [
		marketInfo?.minInitialMargin,
	]);

	const isNextPriceOrder = orderType === 'next price';

	const positionSize = position?.position?.size ? wei(position?.position?.size) : zeroBN;
	const orderDetails = useMemo(() => {
		return {
			newSize: nativeSizeWei,
			size: (positionSize ?? zeroBN).add(nativeSizeDelta).abs(),
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [leverageSide, positionSize]);

	const { commitDeposit } = useMemo(
		() => computeDelayedOrderFee(marketInfo, wei(orderDetails.newSize)),
		[marketInfo, orderDetails]
	);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(marketInfo?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, marketInfo?.keeperDeposit]);

	const getPotentialAvailableMargin = useCallback(
		(trade: FuturesPotentialTradeDetails | null, marketMaxLeverage: Wei | undefined) => {
			let inaccessible;

			inaccessible =
				(marketMaxLeverage && trade?.notionalValue.div(marketMaxLeverage).abs()) ?? zeroBN;

			// If the user has a position open, we'll enforce a min initial margin requirement.
			if (inaccessible.gt(0)) {
				if (inaccessible.lt(minInitialMargin)) {
					inaccessible = minInitialMargin;
				}
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
		return isNextPriceOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [
		potentialTrade,
		marketInfo?.maxLeverage,
		isNextPriceOrder,
		totalDeposit,
		getPotentialAvailableMargin,
	]);

	const previewTradeData = React.useMemo(() => {
		const size = nativeSizeDelta.abs();

		const potentialMarginUsage = potentialTrade?.margin.gt(0)
			? potentialTrade!.margin.sub(previewAvailableMargin).div(potentialTrade!.margin).abs() ??
			  zeroBN
			: zeroBN;

		const potentialBuyingPower =
			previewAvailableMargin?.mul(maxLeverage ?? zeroBN)?.abs() ?? zeroBN;

		return {
			showPreview: size && !size.eq(0) && !!potentialTrade,
			totalMargin: potentialTrade?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [nativeSizeDelta, potentialTrade, previewAvailableMargin, maxLeverage]);

	return (
		<StyledInfoBox
			dataTestId="market-info-box"
			details={{
				'Available Margin': {
					value: `${formatDollars(availableMargin, {
						currencyKey: undefined,
					})}`,
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
							{formatDollars(previewTradeData?.availableMargin)}
						</PreviewArrow>
					),
				},
				'Buying Power': {
					value: `${formatDollars(buyingPower, {
						currencyKey: undefined,
					})}`,
					valueNode: previewTradeData?.buyingPower && (
						<PreviewArrow showPreview={previewTradeData.showPreview && !potentialTrade?.showStatus}>
							{formatDollars(previewTradeData?.buyingPower)}
						</PreviewArrow>
					),
				},
				'Margin Usage': {
					value: `${formatPercent(marginUsage)}`,
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
