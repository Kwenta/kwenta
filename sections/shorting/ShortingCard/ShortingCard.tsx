import { FC } from 'react';
import styled from 'styled-components';

import { SYNTHS_MAP } from 'constants/currency';

import media from 'styles/media';

import CRatioSelector from './components/CRatioSelector';

import useShort from '../hooks/useShort';

import { CurrencyCardsSelector } from 'styles/common';

const ShortingCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useShort({
		defaultBaseCurrencyKey: SYNTHS_MAP.sETH,
		defaultQuoteCurrencyKey: SYNTHS_MAP.sUSD,
	});

	return (
		<Container>
			<ConvertContainer>
				<ExchangeCards>
					{quoteCurrencyCard}
					{baseCurrencyCard}
					<StyledCurrencyCardsSelector>
						<CRatioSelector />
					</StyledCurrencyCardsSelector>
				</ExchangeCards>
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
	${media.lessThan('md')`
		margin-top: -14px;
	`}
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export const ExchangeCards = styled.div`
	position: relative;
	display: grid;
	grid-template-columns: 1fr 1fr;
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
		${media.lessThan('md')`
			padding: unset;
		`}
		.currency-wallet-container {
			width: 90%;
			${media.lessThan('md')`
				width: 100%;
			`}
		}
	}
	.currency-card-base {
		.currency-card-body {
			position: relative;
			left: 30px;
			${media.lessThan('md')`
				left: unset;
			`}
		}
	}
`;

export default ShortingCard;
