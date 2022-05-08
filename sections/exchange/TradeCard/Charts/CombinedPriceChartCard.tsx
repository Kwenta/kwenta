import { FC } from 'react';
import styled from 'styled-components';

import { CurrencyKey } from 'constants/currency';
import { Period } from 'constants/period';
import { AbsoluteCenteredDiv, FlexDiv, FlexDivCol } from 'styles/common';
import useMarketClosed from 'hooks/useMarketClosed';

import { ChartData, ChartBody, OverlayMessage } from './common/styles';
import OverlayMessageContainer from './common/OverlayMessage';

import TVChart from 'components/TVChart';

type CombinedPriceChartCardProps = {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	basePriceRate: number | null;
	quotePriceRate: number | null;
	className?: string;
	selectedChartPeriod: Period;
	setSelectedChartPeriod: (p: Period) => void;
	openAfterHoursModalCallback?: () => void;
};

const CombinedPriceChartCard: FC<CombinedPriceChartCardProps> = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	basePriceRate,
	quotePriceRate,
	selectedChartPeriod,
	openAfterHoursModalCallback,
	...rest
}) => {
	const {
		isMarketClosed: isBaseMarketClosed,
		marketClosureReason: baseMarketClosureReason,
	} = useMarketClosed(baseCurrencyKey);
	const {
		isMarketClosed: isQuoteMarketClosed,
		marketClosureReason: quoteMarketClosureReason,
	} = useMarketClosed(quoteCurrencyKey);

	const isMarketClosed = isBaseMarketClosed || isQuoteMarketClosed;

	const showOverlayMessage = isMarketClosed;
	const disabledInteraction = showOverlayMessage;

	return (
		<Container {...rest}>
			<ChartBody>
				{baseCurrencyKey ? (
					<ChartData disabledInteraction={disabledInteraction}>
						<Container {...rest}>
							{quoteCurrencyKey && (
								<TVChart baseCurrencyKey={baseCurrencyKey} quoteCurrencyKey={quoteCurrencyKey} />
							)}
						</Container>
					</ChartData>
				) : (
					<EmptyChartMessage>Select a pair to view chart</EmptyChartMessage>
				)}

				<AbsoluteCenteredDiv>
					{showOverlayMessage ? (
						<OverlayMessage>
							{isBaseMarketClosed && isQuoteMarketClosed ? (
								<BothMarketsClosedOverlayMessageContainer>
									<BothMarketsClosedOverlayMessageItem>
										<OverlayMessageContainer
											{...{
												marketClosureReason: quoteMarketClosureReason,
												currencyKey: quoteCurrencyKey!,
												openAfterHoursModalCallback,
											}}
										/>
									</BothMarketsClosedOverlayMessageItem>
									<BothMarketsClosedOverlayMessageItem>
										<OverlayMessageContainer
											{...{
												marketClosureReason: baseMarketClosureReason,
												currencyKey: baseCurrencyKey!,
												openAfterHoursModalCallback,
											}}
										/>
									</BothMarketsClosedOverlayMessageItem>
								</BothMarketsClosedOverlayMessageContainer>
							) : isBaseMarketClosed ? (
								<OverlayMessageContainer
									{...{
										marketClosureReason: baseMarketClosureReason,
										currencyKey: baseCurrencyKey!,
										openAfterHoursModalCallback,
									}}
								/>
							) : (
								<OverlayMessageContainer
									{...{
										marketClosureReason: quoteMarketClosureReason,
										currencyKey: quoteCurrencyKey!,
										openAfterHoursModalCallback,
									}}
								/>
							)}
						</OverlayMessage>
					) : undefined}
				</AbsoluteCenteredDiv>
			</ChartBody>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
`;

const BothMarketsClosedOverlayMessageContainer = styled(FlexDiv)`
	justify-content: space-around;
	grid-gap: 3rem;
`;

const BothMarketsClosedOverlayMessageItem = styled(FlexDivCol)`
	align-items: center;
`;

const EmptyChartMessage = styled.div`
	text-align: center;
	padding-top: 220px;
	opacity: 0.5;
`;

export default CombinedPriceChartCard;
