import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { ExchangeContext } from 'contexts/ExchangeContext';
import useExchange from 'hooks/useExchange';
import BasicSwap from 'sections/exchange/BasicSwap';
import { MobileSwap } from 'sections/exchange/MobileSwap';
import AppLayout from 'sections/shared/Layout/AppLayout';
import GitHashID from 'sections/shared/Layout/AppLayout/GitHashID';
import { PageContent, FullHeightContainer, MainContent } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';

type ExchangeComponent = FC & { getLayout: (page: HTMLElement) => JSX.Element };

const Exchange: ExchangeComponent = () => {
	const { t } = useTranslation();
	const exchangeData = useExchange({
		footerCardAttached: false,
		routingEnabled: true,
		showNoSynthsCard: false,
	});

	const { baseCurrencyKey, quoteCurrencyKey, inverseRate } = exchangeData;

	return (
		<ExchangeContext.Provider value={exchangeData}>
			<Head>
				<title>
					{!!baseCurrencyKey && !!quoteCurrencyKey && inverseRate.gt(0)
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
							<GitHashID />
						</MainContent>
					</StyledFullHeightContainer>
				</DesktopOnlyView>
				<MobileOrTabletView>
					<MobileSwap />
					<GitHashID />
				</MobileOrTabletView>
			</PageContent>
		</ExchangeContext.Provider>
	);
};

Exchange.getLayout = (page) => <AppLayout>{page}</AppLayout>;

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Exchange;
