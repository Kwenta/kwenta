import { SYNTHS_MAP } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import PriceChartCard from 'sections/futures/Charts/PriceChartCard';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

type MarketInfoProps = {};

const MarketInfo: React.FC<MarketInfoProps> = ({}) => {
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
			<PriceChartCard
				side="base"
				currencyKey={baseCurrencyKey}
				priceRate={basePriceRate}
				alignRight={false}
			/>
			)
		</>
	);
};
export default MarketInfo;
