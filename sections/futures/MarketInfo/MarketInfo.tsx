import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';

import PriceChartCard from 'sections/futures/Charts/PriceChartCard';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Card from 'components/Card';
import UserInfo from '../UserInfo';
import { FuturesMarket } from 'queries/futures/types';

type MarketInfoProps = {
	market: string;
};

const MarketInfo: FC<MarketInfoProps> = ({ market }) => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const futuresMarketsQuery = useGetFuturesMarkets();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const marketSummary: FuturesMarket | null =
		futuresMarketsQuery?.data?.find(({ asset }) => asset === market) ?? null;

	const baseCurrencyKey = market;

	const basePriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, baseCurrencyKey, selectedPriceCurrency.name),
		[exchangeRates, baseCurrencyKey, selectedPriceCurrency]
	);

	const marketInfoCols = useMemo(
		() => [
			{
				title: t('futures.market.info.asset'),
				data: (
					<>
						<StyledCurrencyIcon currencyKey={baseCurrencyKey} />
						{baseCurrencyKey}
					</>
				),
			},
			{
				title: t('futures.market.info.size'),
				data: formatCurrency(selectedPriceCurrency.name, marketSummary?.marketSize ?? zeroBN, {
					currencyKey: selectedPriceCurrency.name,
				}),
			},
			{
				title: t('futures.market.info.volume'),
				data: formatCurrency(selectedPriceCurrency.name, 200000, {
					currencyKey: selectedPriceCurrency.name,
				}),
			},
			{
				title: t('futures.market.info.skew'),
				data: formatCurrency(selectedPriceCurrency.name, marketSummary?.marketSkew ?? zeroBN, {
					currencyKey: selectedPriceCurrency.name,
				}),
			},
			{
				title: t('futures.market.info.rate'),
				data: formatPercent(marketSummary?.currentFundingRate ?? zeroBN),
			},
		],
		[marketSummary, baseCurrencyKey, t, selectedPriceCurrency.name]
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
					{marketInfoCols.map(({ title, data }) => (
						<InfoBox>
							<InfoTitle>{title}</InfoTitle>
							<InfoData>{data}</InfoData>
						</InfoBox>
					))}
				</StyledFlexDiv>
			</MarketInfoContainer>
			<UserInfo marketAsset={baseCurrencyKey} />
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
