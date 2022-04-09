import { FC } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import AppLayout from 'sections/shared/Layout/AppLayout';

import { PageContent, FullHeightContainer, MainContent } from 'styles/common';

import useExchange from 'sections/exchange/hooks/useExchange';
import { formatCurrency } from 'utils/formatters/number';
import { CurrencyKey } from 'constants/currency';
import BasicSwap from 'sections/exchange/BasicSwap';
import { useTranslation } from 'react-i18next';

const Exchange: FC = () => {
	const { t } = useTranslation();
	const { baseCurrencyKey, quoteCurrencyKey, inverseRate } = useExchange({
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
						<MainContent>
							<BasicSwap />
						</MainContent>
					</StyledFullHeightContainer>
				</PageContent>
			</AppLayout>
		</>
	);
};

const StyledFullHeightContainer = styled(FullHeightContainer)`
	padding-top: 14px;
`;

export default Exchange;
