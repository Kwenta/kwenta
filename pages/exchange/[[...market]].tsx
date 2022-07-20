import { FC } from 'react';
import styled from 'styled-components';
import Head from 'next/head';

import { PageContent, FullHeightContainer, MainContent } from 'styles/common';

import useExchange from 'hooks/useExchange';
import { formatCurrency } from 'utils/formatters/number';
import BasicSwap from 'sections/exchange/BasicSwap';
import { useTranslation } from 'react-i18next';
import AppLayout from 'sections/shared/Layout/AppLayout';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { MobileSwap } from 'sections/exchange/MobileSwap';
import { ExchangeContext } from 'contexts/ExchangeContext';

type AppLayoutProps = {
	children: React.ReactNode;
};

type ExchangeComponent = FC & { layout: FC<AppLayoutProps> };

const Exchange: ExchangeComponent = () => {
	const { t } = useTranslation();
	const exchangeData = useExchange({
		footerCardAttached: false,
		routingEnabled: true,
		showNoSynthsCard: true,
	});

	const { baseCurrencyKey, quoteCurrencyKey, inverseRate } = exchangeData;

	return (
		<ExchangeContext.Provider value={exchangeData}>
			<Head>
				<title>
					{baseCurrencyKey != null && quoteCurrencyKey != null
						? t('exchange.page-title-currency-pair', {
								baseCurrencyKey,
								quoteCurrencyKey,
								rate: formatCurrency(quoteCurrencyKey, inverseRate, {
									currencyKey: quoteCurrencyKey,
								}),
						  })
						: t('exchange.page-title')}
				</title>
			</Head>
			<PageContent>
				<DesktopOnlyView>
					<StyledFullHeightContainer>
						<MainContent>
							<BasicSwap />
						</MainContent>
					</StyledFullHeightContainer>
				</DesktopOnlyView>
				<MobileOrTabletView>
					<MobileSwap />
				</MobileOrTabletView>
			</PageContent>
		</ExchangeContext.Provider>
	);
};

Exchange.layout = AppLayout;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Exchange;
