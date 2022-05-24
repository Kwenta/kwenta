import React, { useEffect } from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { Synths } from '@synthetixio/contracts-interface';
import { PotentialTrade } from '../types';

const PreviewArrow: React.FC = (props) => (
	<>
		<StyledArrow />
		<StyledPreviewGold>{props.children}</StyledPreviewGold>
	</>
);

type MarketInfoBoxProps = {
	totalMargin: Wei;
	availableMargin: Wei;
	buyingPower: Wei;
	marginUsage: Wei;
	isMarketClosed: boolean;
	potentialTrade: PotentialTrade | null;
	tradeSizeSUSD: string;
	maxLeverageValue: Wei;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
	totalMargin,
	availableMargin,
	buyingPower,
	marginUsage,
	isMarketClosed,
	potentialTrade,
	tradeSizeSUSD,
	maxLeverageValue,
}) => {
	const [showPotentialTrade, setShowPotentialTrade] = React.useState(false);

	const previewTradeData = React.useMemo(() => {
		const size = wei(potentialTrade?.size || zeroBN);
		const sizeSUSD = wei(tradeSizeSUSD || zeroBN);
		const potentialTotalMargin = totalMargin?.sub(sizeSUSD) || zeroBN;
		const potentialAvailableMargin = availableMargin?.sub(sizeSUSD) || zeroBN;
		const potentialMarginUsage =
			potentialTotalMargin?.sub(potentialAvailableMargin) && !potentialTotalMargin.eq(0)
				? potentialTotalMargin?.sub(potentialAvailableMargin).div(potentialTotalMargin)
				: zeroBN;

		return {
			showPreview: !size.eq(0),
			// totalMargin: potentialTotalMargin.gt(0) ? potentialTotalMargin : zeroBN,
			availableMargin: potentialAvailableMargin.gt(0) ? potentialAvailableMargin : zeroBN,
			buyingPower: potentialTotalMargin.gt(0) ? potentialTotalMargin : zeroBN,
			marginUsage: potentialMarginUsage.gt(0) ? potentialMarginUsage : zeroBN,
		};
	}, [totalMargin, availableMargin, potentialTrade?.size, tradeSizeSUSD]);

	useEffect(() => {
		if (previewTradeData.showPreview) {
			setShowPotentialTrade(true);
		} else {
			setShowPotentialTrade(false);
		}
	}, [previewTradeData.showPreview]);

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
						currencyKey: showPotentialTrade ? undefined : Synths.sUSD,
						sign: '$',
					})}`,
					valueNode: showPotentialTrade ? (
						<PreviewArrow>
							{formatCurrency(Synths.sUSD, previewTradeData.availableMargin, {
								currencyKey: Synths.sUSD,
								sign: '$',
							})}
						</PreviewArrow>
					) : null,
				},
				'Buying Power': {
					value: `${formatCurrency(Synths.sUSD, buyingPower, { sign: '$' })}`,
					valueNode: showPotentialTrade ? (
						<PreviewArrow>
							{formatCurrency(Synths.sUSD, previewTradeData.buyingPower, { sign: '$' })}
						</PreviewArrow>
					) : null,
				},
				'Margin Usage': {
					value: `${formatPercent(marginUsage)}`,
					valueNode: showPotentialTrade ? (
						<PreviewArrow>{formatPercent(previewTradeData.marginUsage)}</PreviewArrow>
					) : null,
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

const StyledArrow = styled.span`
	::before {
		content: '➞';
		color: ${(props) => props.theme.colors.common.secondaryGray};
		font-size: 12px;
		padding: 0px 3px;
		font-family: ${(props) => props.theme.fonts.bold};
	}
`;

const StyledPreviewGold = styled.span`
	color: ${(props) => props.theme.colors.yellow};
`;

export default MarketInfoBox;
