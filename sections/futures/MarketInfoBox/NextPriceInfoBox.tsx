import { Synths } from '@synthetixio/contracts-interface';
import Wei, { wei } from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import PreviewArrow from 'components/PreviewArrow';
import { FuturesPosition } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';
import styled from 'styled-components';
import { computeNPFee } from 'utils/costCalculations';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { getMarketKey } from 'utils/futures';

import { PositionSide } from '../types';

type NextPriceInfoBoxProps = {
	position: FuturesPosition | null;
	isMarketClosed: boolean;
	tradeSize: Wei;
	marketMaxLeverage: Wei | undefined;
	currencyKey: string;
	side: PositionSide;
};

const NextPriceInfoBox: React.FC<NextPriceInfoBoxProps> = ({
	position,
	isMarketClosed,
	marketMaxLeverage,
	currencyKey,
	side,
	tradeSize,
}) => {
	const network = useRecoilValue(networkState);

	const totalMargin = position?.remainingMargin ?? zeroBN;
	const availableMargin = position?.accessibleMargin ?? zeroBN;
	const buyingPower =
		position && position?.accessibleMargin.gt(zeroBN)
			? position?.accessibleMargin?.mul(marketMaxLeverage ?? zeroBN)
			: zeroBN;

	const marginUsage =
		position && position?.remainingMargin.gt(zeroBN)
			? position?.remainingMargin?.sub(position?.accessibleMargin).div(position?.remainingMargin)
			: zeroBN;

	const positionSize = position?.position?.size ? wei(position?.position?.size) : zeroBN;

	const nextPriceDetailsQuery = useGetNextPriceDetails(getMarketKey(currencyKey, network.id));
	const nextPriceDetails = nextPriceDetailsQuery?.data;

	const orderDetails = useMemo(() => {
		const newSize = side === PositionSide.LONG ? tradeSize : -tradeSize;
		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [side, positionSize]);

	const { commitDeposit, nextPriceFee } = useMemo(
		() => computeNPFee(nextPriceDetails, wei(orderDetails.newSize)),
		[nextPriceDetails, orderDetails]
	);

	const totalDeposit = useMemo(() => {
		return (commitDeposit ?? zeroBN).add(nextPriceDetails?.keeperDeposit ?? zeroBN);
	}, [commitDeposit, nextPriceDetails?.keeperDeposit]);

	// const nextPriceDiscount = useMemo(() => {
	// 	return (nextPriceFee ?? zeroBN).sub(commitDeposit ?? zeroBN);
	// }, [commitDeposit, nextPriceFee]);

	const previewTradeData = React.useMemo(() => {
		const potentialAvailableMargin = availableMargin?.sub(totalDeposit) ?? zeroBN;
		const potentialBuyingPower =
			potentialAvailableMargin.sub(totalDeposit)?.mul(marketMaxLeverage)?.abs() ?? zeroBN;
		const enumerator = totalMargin?.sub(totalDeposit)?.sub(potentialAvailableMargin);
		const potentialMarginUsage = enumerator?.div(totalMargin?.sub(totalDeposit))?.abs() ?? zeroBN;
		console.log(
			potentialAvailableMargin.toNumber(),
			potentialBuyingPower.toNumber(),
			enumerator.toNumber(),
			potentialMarginUsage.toNumber()
		);
		return {
			showPreview: !tradeSize.eq(0),
			availableMargin: potentialAvailableMargin.gt(0) ? potentialAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(0) ? potentialMarginUsage : zeroBN,
		};
	}, [availableMargin, totalDeposit, totalMargin, marketMaxLeverage, tradeSize]);

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
						<PreviewArrow showPreview={previewTradeData.showPreview}>
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
						<PreviewArrow showPreview={previewTradeData.showPreview}>
							{formatCurrency(Synths.sUSD, previewTradeData?.buyingPower, {
								sign: '$',
							})}
						</PreviewArrow>
					),
				},
				'Margin Usage': {
					value: `${formatPercent(marginUsage)}`,
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview}>
							{formatPercent(previewTradeData?.marginUsage)}
						</PreviewArrow>
					),
				},
			}}
			disabled={isMarketClosed}
		/>
	);
};

const StyledInfoBox = styled(InfoBox)`
	margin-bottom: 16px;

	.value {
		font-family: ${(props) => props.theme.fonts.regular};
	}
`;

export default NextPriceInfoBox;
