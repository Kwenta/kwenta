import React from 'react';
import styled from 'styled-components';
import Wei, { wei } from '@synthetixio/wei';
import InfoBox from 'components/InfoBox';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { CurrencyKey, Synths } from '@synthetixio/contracts-interface';
import { PotentialTrade } from '../types';
import PreviewArrow from 'components/PreviewArrow';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import { FuturesPosition, FuturesPotentialTradeDetails } from 'queries/futures/types';

type MarketInfoBoxProps = {
	position: FuturesPosition | null;
	isMarketClosed: boolean;
	potentialTrade: PotentialTrade | null;
	marketMaxLeverage: Wei | undefined;
	currencyKey: string;
};

const MarketInfoBox: React.FC<MarketInfoBoxProps> = ({
	position,
	isMarketClosed,
	potentialTrade,
	marketMaxLeverage,
	currencyKey,
}) => {
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

		return previewTrade?.margin?.sub(inaccessible).abs() ?? zeroBN;
	};

	const previewTradeData = React.useMemo(() => {
		const size = wei(potentialTrade?.size || zeroBN);
		const potentialAvailableMargin = getPotentialAvailableMargin(previewTrade, marketMaxLeverage);
		const potentialBuyingPower = potentialAvailableMargin?.mul(marketMaxLeverage).abs() ?? zeroBN;
		const enumeratorMarginUsage = previewTrade?.margin?.sub(potentialAvailableMargin);
		const potentialMarginUsage = enumeratorMarginUsage?.div(previewTrade?.margin)?.abs() ?? zeroBN;

		return {
			showPreview: size && !size.eq(0),
			totalMargin: previewTrade?.margin || zeroBN,
			availableMargin: potentialAvailableMargin.gt(0) ? potentialAvailableMargin : zeroBN,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : zeroBN,
			marginUsage: potentialMarginUsage.gt(0) ? potentialMarginUsage : zeroBN,
		};
	}, [potentialTrade?.size, previewTrade, marketMaxLeverage]);

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
