import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesTradingVolume from 'queries/futures/useGetFuturesTradingVolume';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';

import PriceChartCard from 'sections/exchange/TradeCard/Charts/PriceChartCard';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import Card from 'components/Card';
import UserInfo from '../UserInfo';
import { FuturesMarket } from 'queries/futures/types';
import { ChartType } from 'constants/chartType';
import { Period } from 'constants/period';
import { singleChartTypeState, singleChartPeriodState } from 'store/app';
import usePersistedRecoilState from 'hooks/usePersistedRecoilState';
import { CurrencyKey } from 'constants/currency';

type MarketInfoProps = {
	market: string;
};

const MarketInfo: FC<MarketInfoProps> = ({ market }) => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresTradingVolumeQuery = useGetFuturesTradingVolume(market);

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const futuresTradingVolume = futuresTradingVolumeQuery?.data ?? null;
	const marketSummary: FuturesMarket | null =
		futuresMarketsQuery?.data?.find(({ asset }) => asset === market) ?? null;

	const baseCurrencyKey = market as CurrencyKey;

	const [chartType, setChartType] = usePersistedRecoilState<ChartType>(singleChartTypeState);
	const [chartPeriod, setChartPeriod] = usePersistedRecoilState<Period>(singleChartPeriodState);

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
				data: formatCurrency(
					selectedPriceCurrency.name,
					marketSummary?.marketSize?.mul(wei(basePriceRate ?? 0)) ?? zeroBN,
					{
						sign: '$',
					}
				),
			},
			{
				title: t('futures.market.info.volume'),
				data: formatCurrency(market, futuresTradingVolume ?? zeroBN, {
					currencyKey: market,
				}),
			},
			{
				title: t('futures.market.info.skew'),
				data: formatCurrency(
					selectedPriceCurrency.name,
					marketSummary?.marketSkew?.mul(wei(basePriceRate ?? 0)) ?? zeroBN,
					{
						sign: '$',
					}
				),
			},
			{
				title: t('futures.market.info.rate'),
				data: formatPercent(marketSummary?.currentFundingRate ?? zeroBN),
			},
		],
		[
			marketSummary,
			baseCurrencyKey,
			t,
			selectedPriceCurrency.name,
			basePriceRate,
			futuresTradingVolume,
			market,
		]
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
				selectedChartType={chartType}
				setSelectedChartType={setChartType}
				selectedChartPeriod={chartPeriod}
				setSelectedChartPeriod={setChartPeriod}
			/>
			<MarketInfoContainer>
				<StyledFlexDiv>
					{marketInfoCols.map(({ title, data }, i) => (
						<InfoBox key={`infobox-${i}`}>
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
