import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { SYNTHS_MAP } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import PriceChartCard from 'sections/futures/Charts/PriceChartCard';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import Card from 'components/Card';
import { FlexDivRowCentered } from 'styles/common';
import Head from 'next/head';
import { formatCurrency } from 'utils/formatters/number';

type MarketInfoProps = {};

const MarketInfo: React.FC<MarketInfoProps> = ({}) => {
	const { t } = useTranslation();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();

	// @TODO: change to be variable
	const baseCurrencyKey = SYNTHS_MAP.sBTC;

	const basePriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, selectedPriceCurrency.name),
		[exchangeRates, baseCurrencyKey]
	);

	return (
		<>
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
			<PriceChartCard
				side="base"
				currencyKey={baseCurrencyKey}
				priceRate={basePriceRate}
				alignRight={false}
			/>
			<MarketInfoContainer>
				<StyledFlexDiv></StyledFlexDiv>
			</MarketInfoContainer>
		</>
	);
};
export default MarketInfo;

const MarketInfoContainer = styled(Card)``;

const StyledFlexDiv = styled(FlexDivRowCentered)``;
