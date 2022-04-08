import { FC } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { Svg } from 'react-optimized-image';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, SwapCurrenciesButton, FullHeightContainer, MainContent } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { zIndex } from 'constants/ui';
import useExchange from 'sections/exchange/hooks/useExchange';
import { formatCurrency } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';

const Exchange: FC = () => {
	const { t } = useTranslation();
	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		inverseRate,
		quoteCurrencyCard,
		baseCurrencyCard,
		footerCard,
	} = useExchange({
		showPriceCard: true,
		showMarketDetailsCard: true,
		footerCardAttached: false,
		routingEnabled: true,
		persistSelectedCurrencies: true,
		showNoSynthsCard: true,
	});

	return (
		<>
			<Head>
				<title>
					{baseCurrencyKey != null && quoteCurrencyKey != null
						? t('exchange.page-title-currency-pair', {
								baseCurrencyKey,
								quoteCurrencyKey,
								rate: formatCurrency(quoteCurrencyKey as CurrencyKey, inverseRate, {
									currencyKey: quoteCurrencyKey as CurrencyKey,
								}),
						  })
						: t('exchange.page-title')}
				</title>
			</Head>
			<AppLayout>
				<PageContent>
					<StyledFullHeightContainer>
						<StyledMainContent>
							<ExchangeTitle>{t('exchange.synth-exchange')}</ExchangeTitle>
							<PageWidthContainer>
								<DesktopCardsContainer>
									<TopCardContainer data-testid="top-side">{quoteCurrencyCard}</TopCardContainer>
									<SwapCurrenciesButtonContainer>
										<SwapCurrenciesButton data-testid="swap-btn">
												<Svg src={ArrowIcon} />
										</SwapCurrenciesButton>
									</SwapCurrenciesButtonContainer>
									<BottomCardContainer data-testid="bottom-side">
										{baseCurrencyCard}
									</BottomCardContainer>
								</DesktopCardsContainer>
							</PageWidthContainer>

							<PageWidthContainer>{footerCard}</PageWidthContainer>
						</StyledMainContent>
					</ StyledFullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

export default Exchange;

const ExchangeTitle = styled.p`
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 30px;
	font-weight: 700;
	line-height: 30px;
	text-align: center;
`;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;


const SwapCurrenciesButtonContainer = styled.div`
	align-self: flex-start;
	margin-top: 170px;
	position: absolute;
	left: calc(50% - 16px);
	z-index: ${zIndex.BASE + 10};
`;

const PageWidthContainer = styled.div`
	width: 565px;
	margin: 0 auto;
`;

const StyledMainContent = styled(MainContent)`
	max-width: initial;
`;

const DesktopCardsContainer = styled.div`
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(255, 255, 255, 0.07);
	border-radius: 4px;
	background: ${(props) => props.theme.colors.cellGradient};
	box-sizing: border-box;
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1), inset 0px 0px 20px rgba(255, 255, 255, 0.03);
`;


const CardContainerMixin = `
	display: grid;
	height: 183px;
`;

const TopCardContainer = styled.div`
	${CardContainerMixin};

`;

const BottomCardContainer = styled.div`
	${CardContainerMixin};
`;

