import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';
import { PotentialTrade } from '../types';
import PreviewArrow from 'components/PreviewArrow';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';

type MarketInfoBoxProps = {
	totalMargin: Wei;
	availableMargin: Wei;
	buyingPower: Wei;
	marginUsage: Wei;
	isMarketClosed: boolean;
	potentialTrade: PotentialTrade | null;
	maxLeverageValue: Wei;
	currencyKey: string;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
	totalMargin,
	availableMargin,
	buyingPower,
	marginUsage,
	isMarketClosed,
	potentialTrade,
	maxLeverageValue,
	currencyKey,
}) => {
	const potentialTradeDetails = useGetFuturesPotentialTradeDetails(
		currencyKey as CurrencyKey,
		potentialTrade
	);

	const previewTrade = potentialTradeDetails.data ?? null;

	const previewTradeData = React.useMemo(() => {
		const size = wei(potentialTrade?.size || zeroBN);
		const potentialAvailableMargin =
			previewTrade?.margin?.sub(previewTrade?.minInitialMargin) || zeroBN;
		const potentialBuyingPower = previewTrade?.margin?.mul(maxLeverageValue);
		const potentialMarginUsage =
			previewTrade?.margin.sub(potentialAvailableMargin).div(previewTrade?.margin).abs() || zeroBN;

		return {
			showPreview: size && !size.eq(0),
			totalMargin: previewTrade?.margin || zeroBN,
			availableMargin: potentialAvailableMargin, // potentialAvailableMargin.gt(0) ? : zeroBN,
			buyingPower: potentialBuyingPower, // potentialTotalMargin.gt(0) ? : zeroBN,
			marginUsage: potentialMarginUsage, // potentialMarginUsage.gt(0) ? : zeroBN,
		};
	}, [
		potentialTrade?.size,
		previewTrade?.margin,
		previewTrade?.minInitialMargin,
		maxLeverageValue,
	]);

	return (
		<StyledInfoBox
			details={{
				'Total Margin': {
					value: `${formatCurrency(Synths.sUSD, totalMargin, {
						currencyKey: Synths.sUSD,
						sign: '$',
					})}`,
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
							{formatCurrency(Synths.sUSD, previewTradeData?.totalMargin, {
								currencyKey: Synths.sUSD,
								sign: '$',
							})}
						</PreviewArrow>
					),
				},
				'Available Margin': {
					value: `${formatCurrency(Synths.sUSD, availableMargin, {
						currencyKey: previewTradeData.showPreview ? undefined : Synths.sUSD,
						sign: '$',
					})}`,
					valueNode: (
						<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
							{formatCurrency(Synths.sUSD, previewTradeData?.availableMargin, {
								currencyKey: Synths.sUSD,
								sign: '$',
							})}
						</PreviewArrow>
					),
				},
				'Buying Power': {
					value: `${formatCurrency(Synths.sUSD, buyingPower, { sign: '$' })}`,
					valueNode: previewTradeData?.buyingPower && (
						<PreviewArrow showPreview={previewTradeData.showPreview && !previewTrade?.showStatus}>
							{formatCurrency(Synths.sUSD, previewTradeData?.buyingPower, { sign: '$' })}
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
