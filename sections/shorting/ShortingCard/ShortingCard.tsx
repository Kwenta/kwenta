import { FC } from 'react';
import styled from 'styled-components';

import { SYNTHS_MAP } from 'constants/currency';

import media from 'styles/media';

import useShort from '../hooks/useShort';

const ShortingCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useShort({
		defaultBaseCurrencyKey: SYNTHS_MAP.sETH,
		defaultQuoteCurrencyKey: SYNTHS_MAP.sUSD,
		shortRatio: 2,
	});

	return (
		<Container>
			<ConvertContainer>
				<ExchangeCards>
					{quoteCurrencyCard}
					{baseCurrencyCard}
				</ExchangeCards>
				<ExchangeFooter>{footerCard}</ExchangeFooter>
			</ConvertContainer>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
	margin-bottom: 30px;
`;

const ConvertContainer = styled.div``;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export const ExchangeCards = styled.div`
	display: grid;
	grid-template-columns: auto auto;
	grid-gap: 2px;
	padding-bottom: 2px;
	width: 100%;
	margin: 0 auto;
	${media.lessThan('md')`
		grid-template-columns: unset;
		grid-template-rows: auto auto;
		padding-bottom: 24px;
	`}

	.currency-card {
		padding: 0 14px;
		width: 100%;
	}
`;

export default ShortingCard;
