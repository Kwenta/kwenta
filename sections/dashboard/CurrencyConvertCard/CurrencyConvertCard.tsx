import { FC } from 'react';
import styled from 'styled-components';

import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

import media from 'styles/media';

import useExchange from 'sections/exchange/hooks/useExchange';

const CurrencyConvertCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useExchange({
		defaultBaseCurrencyKey: SYNTHS_MAP.sUSD,
		defaultQuoteCurrencyKey: CRYPTO_CURRENCY_MAP.ETH,
		footerCardAttached: true,
		persistSelectedCurrencies: false,
		allowCurrencySelection: false,
		showNoSynthsCard: false,
		txProvider: '1inch',
	});

	return (
		<Container>
			<ExchangeCards>
				{quoteCurrencyCard}
				{baseCurrencyCard}
			</ExchangeCards>
			<ExchangeFooter>{footerCard}</ExchangeFooter>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
`;

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

export default CurrencyConvertCard;
