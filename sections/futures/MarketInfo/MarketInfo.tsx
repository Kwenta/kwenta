import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency, formatPercent } from 'utils/formatters/number';

import { SYNTHS_MAP } from 'constants/currency';

import PriceChartCard from 'sections/futures/Charts/PriceChartCard';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Card from 'components/Card';
import UserInfo from '../UserInfo';

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
			<PriceChartCard currencyKey={baseCurrencyKey} priceRate={basePriceRate} alignRight={false} />
			<MarketInfoContainer>
				<StyledFlexDiv>
					<InfoBox>
						<InfoTitle>{t('futures.market.info.asset')}</InfoTitle>
						<InfoData>
							<StyledCurrencyIcon currencyKey={baseCurrencyKey} />
							{baseCurrencyKey}
						</InfoData>
					</InfoBox>
					<InfoBox>
						<InfoTitle>{t('futures.market.info.size')}</InfoTitle>
						<InfoData>
							{formatCurrency(selectedPriceCurrency.name, 10000, {
								currencyKey: selectedPriceCurrency.name,
							})}
						</InfoData>
					</InfoBox>
					<InfoBox>
						<InfoTitle>{t('futures.market.info.volume')}</InfoTitle>
						<InfoData>
							{formatCurrency(selectedPriceCurrency.name, 200000, {
								currencyKey: selectedPriceCurrency.name,
							})}
						</InfoData>
					</InfoBox>
					<InfoBox>
						<InfoTitle>{t('futures.market.info.skew')}</InfoTitle>
						<InfoData>
							{formatCurrency(selectedPriceCurrency.name, 200000, {
								currencyKey: selectedPriceCurrency.name,
							})}
						</InfoData>
					</InfoBox>
					<InfoBox>
						<InfoTitle>{t('futures.market.info.debt')}</InfoTitle>
						<InfoData>
							{formatCurrency(selectedPriceCurrency.name, 100000, {
								currencyKey: selectedPriceCurrency.name,
							})}
						</InfoData>
					</InfoBox>
					<InfoBox>
						<InfoTitle>{t('futures.market.info.rate')}</InfoTitle>
						<InfoData>{formatPercent(0.005)}</InfoData>
					</InfoBox>
				</StyledFlexDiv>
			</MarketInfoContainer>
			<UserInfo baseCurrencyKey={baseCurrencyKey} />
		</>
	);
};
export default MarketInfo;

const MarketInfoContainer = styled(Card)`
	margin: 16px 0px;
`;

const StyledFlexDiv = styled(FlexDivRow)`
	justify-content: space-evenly;
	align-items: center;
`;

const InfoBox = styled(FlexDivCol)`
	padding: 20px;
`;

const InfoTitle = styled.div`
	color: ${(props) => props.theme.colors.blueberry};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	text-transform: capitalize;
	margin-bottom: 16px;
`;

const InfoData = styled(FlexDivRow)`
	align-items: center;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	margin-right: 4px;
`;
