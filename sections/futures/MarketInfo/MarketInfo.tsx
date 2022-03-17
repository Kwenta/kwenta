import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components'; 
import useSynthetixQueries from '@synthetixio/queries';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency } from 'utils/formatters/number';

import PriceChartCard from 'sections/exchange/TradeCard/Charts/PriceChartCard';

import UserInfo from '../UserInfo';
import { ChartType } from 'constants/chartType';
import { Period } from 'constants/period';
import { singleChartTypeState, singleChartPeriodState } from 'store/app';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { CurrencyKey } from 'constants/currency';
import MarketDetails from '../MarketDetails';

type MarketInfoProps = {
	market: string;
};

const MarketInfo: FC<MarketInfoProps> = ({ market }) => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const baseCurrencyKey = market as CurrencyKey;

	const [chartType, setChartType] = usePersistedRecoilState<ChartType>(singleChartTypeState);
	const [chartPeriod, setChartPeriod] = usePersistedRecoilState<Period>(singleChartPeriodState);

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
			<MarketDetails baseCurrencyKey={baseCurrencyKey} />
			<PriceChartCard
				side="base"
				currencyKey={baseCurrencyKey}
				priceRate={basePriceRate}
				selectedChartType={chartType}
				setSelectedChartType={setChartType}
				selectedChartPeriod={chartPeriod}
				setSelectedChartPeriod={setChartPeriod}
			/>
			<UserInfo marketAsset={baseCurrencyKey} />
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 48px;
`

export default MarketInfo;
