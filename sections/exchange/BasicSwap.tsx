import { FC, memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import * as Text from 'components/Text';

import SwapCurrencies from './SwapCurrencies';
import BaseCurrencyCard from './TradeCard/Cards/BaseCurrencyCard';
import FooterCard from './TradeCard/Cards/FooterCard';
import QuoteCurrencyCard from './TradeCard/Cards/QuoteCurrencyCard';

const BasicSwap: FC = memo(() => {
	const { t } = useTranslation();

	return (
		<>
			<ExchangeTitle>{t('exchange.synth-exchange')}</ExchangeTitle>
			<PageWidthContainer>
				<DesktopCardsContainer>
					<QuoteCurrencyCard />
					<SwapCurrencies />
					<BaseCurrencyCard />
				</DesktopCardsContainer>
				<FooterCard />
			</PageWidthContainer>
		</>
	);
});

export default BasicSwap;

const ExchangeTitle = styled(Text.Body).attrs({ variant: 'bold' })`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 30px;
	margin-bottom: 1.5em;
	text-align: center;
`;

const DesktopCardsContainer = styled.div`
	display: flex;
	flex-direction: column;
	background: ${(props) => props.theme.colors.selectedTheme.cell.fill};
	border-radius: 10px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	box-sizing: border-box;
	position: relative;
`;

const PageWidthContainer = styled.div`
	width: 565px;
	margin: 0 auto;
`;
