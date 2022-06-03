import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency } from 'utils/formatters/number';

import UserInfo from '../UserInfo';
import MarketDetails from '../MarketDetails';
import PositionChart from '../PositionChart';
import { currentMarketState } from 'store/futures';

const MarketInfo: FC = () => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const baseCurrencyKey = useRecoilValue(currentMarketState);

	const basePriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, selectedPriceCurrency.name),
		[exchangeRates, baseCurrencyKey, selectedPriceCurrency]
	);

	return (
		<Container>
			<Head>
				<title>
					{basePriceRate
						? t('futures.market.page-title-rate', {
								baseCurrencyKey,
								rate: formatCurrency(selectedPriceCurrency.name, basePriceRate, {
									currencyKey: selectedPriceCurrency.name,
								}),
						  })
						: t('futures.market.page-title')}
				</title>
			</Head>
			<MarketDetails />
			<PositionChart />
			<UserInfo />
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 48px;
`;

export default MarketInfo;
