import { FC } from 'react';
import styled from 'styled-components';

import { CRYPTO_CURRENCY_MAP, Synths } from 'constants/currency';

import useExchange from 'sections/exchange/hooks/useExchange';

import { CurrencyCardsSelector, ExchangeCardsWithSelector } from 'styles/common';

import SlippageSelector from './SlippageSelector';

const CurrencyConvertCard: FC = () => {
	const { quoteCurrencyCard, baseCurrencyCard, footerCard } = useExchange({
		defaultBaseCurrencyKey: Synths.sUSD,
		defaultQuoteCurrencyKey: CRYPTO_CURRENCY_MAP.ETH,
		footerCardAttached: true,
		persistSelectedCurrencies: false,
		allowQuoteCurrencySelection: true,
		allowBaseCurrencySelection: true,
		showNoSynthsCard: false,
		txProvider: '1inch',
	});

	return (
		<Container>
			<ExchangeCardsWithSelector>
				{quoteCurrencyCard}
				{baseCurrencyCard}
				<StyledCurrencyCardsSelector>
					<SlippageSelector />
				</StyledCurrencyCardsSelector>
			</ExchangeCardsWithSelector>
			<ExchangeFooter>{footerCard}</ExchangeFooter>
		</Container>
	);
};

const Container = styled.div`
	position: relative;
`;

const StyledCurrencyCardsSelector = styled(CurrencyCardsSelector)`
	width: 80px;
`;

export const ExchangeFooter = styled.div`
	.footer-card {
		max-width: 1000px;
	}
`;

export default CurrencyConvertCard;
