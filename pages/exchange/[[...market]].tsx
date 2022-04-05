import { FC } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { Svg } from 'react-optimized-image';

import ArrowsIcon from 'assets/svg/app/arrows.svg';
import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, SwapCurrenciesButton, FlexDivCol, FullHeightContainer } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { zIndex } from 'constants/ui';
import useExchange from 'sections/exchange/hooks/useExchange';
import { DEFAULT_WIDTH } from 'sections/exchange/TradeCard/constants';
import { formatCurrency } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import GitIDFooter from 'sections/shared/Layout/AppLayout/GitID';

const Exchange: FC = () => {
	const { t } = useTranslation();
	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		inverseRate,
		quoteCurrencyCard,
		baseCurrencyCard,
		handleCurrencySwap,
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
				<StyledPageContent>
					<FullHeightContainer>
						<DesktopContainer>
							<SwapCurrenciesButtonContainer>
								<SwapCurrenciesButton onClick={handleCurrencySwap} data-testid="swap-btn">
										<Svg src={ArrowsIcon} />
								</SwapCurrenciesButton>
							</SwapCurrenciesButtonContainer>
							<PageWidthContainer>
								<DesktopCardsContainer>
									<LeftCardContainer data-testid="left-side">{quoteCurrencyCard}</LeftCardContainer>
									<RightCardContainer data-testid="right-side">
										{baseCurrencyCard}
									</RightCardContainer>
								</DesktopCardsContainer>
							</PageWidthContainer>

							<PageWidthContainer>{footerCard}</PageWidthContainer>
						<GitIDFooter />
						</DesktopContainer>
					</FullHeightContainer>
				</StyledPageContent>
			</AppLayout>
		</>
	);
};

export default Exchange;

const StyledPageContent = styled(PageContent)`
	max-width: 1440px;
`;

const SwapCurrenciesButtonContainer = styled.div`
	align-self: flex-start;
	margin-top: 37px;
	position: absolute;
	left: calc(50% - 16px);
	z-index: ${zIndex.BASE + 10};
`;

const PageWidthContainer = styled.div`
	width: ${DEFAULT_WIDTH}px;
	margin: 0 auto;
`;

const DesktopContainer = styled(FlexDivCol)``;

const DesktopCardsContainer = styled.div`
	display: grid;
	padding-bottom: 2px;
	gap: 2px;
	grid-template-columns: 1fr 1fr;
	flex: 1;
`;

const CardContainerMixin = `
	display: grid;
`;

const LeftCardContainer = styled.div`
	${CardContainerMixin};
`;

const RightCardContainer = styled.div`
	${CardContainerMixin};
`;

