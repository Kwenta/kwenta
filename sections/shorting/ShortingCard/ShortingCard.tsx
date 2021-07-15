import { FC } from 'react';
import styled from 'styled-components';

import { Synths } from 'constants/currency';

import media from 'styles/media';

import CRatioSelector from './components/CRatioSelector';

import useShort from '../hooks/useShort';

import { CurrencyCardsSelector, ExchangeCardsWithSelector } from 'styles/common';

const ShortingCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useShort({
		defaultBaseCurrencyKey: Synths.sETH,
		defaultQuoteCurrencyKey: Synths.sUSD,
	});

	return (
		<Container>
			<ConvertContainer>
				<ExchangeCardsWithSelector>
					{quoteCurrencyCard}
					{baseCurrencyCard}
					<StyledCurrencyCardsSelector>
						<CRatioSelector />
					</StyledCurrencyCardsSelector>
				</ExchangeCardsWithSelector>
				<ExchangeFooter>{footerCard}</ExchangeFooter>
			</ConvertContainer>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	margin-bottom: 30px;
	${media.lessThan('md')`
		// TODO: this is needed to cancel the content "push" that comes content from "TradeSummaryCard" (on tablet/mobile)
		margin-bottom: -50px;
	`}
`;

const ConvertContainer = styled.div``;

const StyledCurrencyCardsSelector = styled(CurrencyCardsSelector)`
	width: 70px;
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export default ShortingCard;
