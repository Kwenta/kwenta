import React, { useMemo } from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';
import { PositionSide, PotentialTrade } from '../types';
import PreviewArrow from 'components/PreviewArrow';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import { FuturesPosition, FuturesPotentialTradeDetails } from 'queries/futures/types';
import useGetNextPriceDetails from 'queries/futures/useGetNextPriceDetails';
import { computeNPFee } from 'utils/costCalculations';
import { getMarketKey } from 'utils/futures';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';

type MarketInfoBoxProps = {
	position: FuturesPosition | null;
	isMarketClosed: boolean;
	potentialTrade: PotentialTrade | null;
	marketMaxLeverage: Wei | undefined;
	currencyKey: string;
	tradeSize: Wei;
	side: PositionSide;
	orderType: number;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
	position,
	isMarketClosed,
	potentialTrade,
	marketMaxLeverage,
	currencyKey,
	tradeSize,
	side,
	orderType,
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

	const potentialTradeDetails = useGetFuturesPotentialTradeDetails(
		currencyKey as CurrencyKey,
		potentialTrade
	);

	const previewTrade = potentialTradeDetails.data ?? null;
	const isNextPriceOrder = orderType === 1;
	const nextPriceDetailsQuery = useGetNextPriceDetails(getMarketKey(currencyKey, network.id));
	const nextPriceDetails = nextPriceDetailsQuery?.data;

	const positionSize = position?.position?.size ? wei(position?.position?.size) : zeroBN;
	const orderDetails = useMemo(() => {
		const newSize = side === PositionSide.LONG ? tradeSize : -tradeSize;
		return { newSize, size: (positionSize ?? zeroBN).add(newSize).abs() };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [side, positionSize]);

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
		const potentialAvailableMargin = getPotentialAvailableMargin(previewTrade, marketMaxLeverage);
		return isNextPriceOrder
			? potentialAvailableMargin?.sub(totalDeposit) ?? zeroBN
			: potentialAvailableMargin;
	}, [previewTrade, marketMaxLeverage, isNextPriceOrder, totalDeposit]);

	const previewTradeData = React.useMemo(() => {
		const size = wei(potentialTrade?.size || zeroBN);
		const potentialMarginUsage =
			previewTrade?.margin?.sub(previewAvailableMargin)?.div(previewTrade?.margin)?.abs() ?? zeroBN;
		const potentialBuyingPower =
			previewAvailableMargin?.mul(marketMaxLeverage ?? zeroBN)?.abs() ?? zeroBN;

		return {
			showPreview: size && !size.eq(0),
			totalMargin: previewTrade?.margin || zeroBN,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		};
	}, [potentialTrade?.size, previewTrade?.margin, previewAvailableMargin, marketMaxLeverage]);

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

export default MarketInfoBox;
