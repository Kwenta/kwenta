import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import FuturesPositionsTable from 'sections/dashboard/FuturesPositionsTable';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';

import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency } from 'utils/formatters/number';

import UserInfo from '../UserInfo';
import { CurrencyKey, Synths } from 'constants/currency';
import MarketDetails from '../MarketDetails';
import TVChart from 'components/TVChart';
import { MarketState } from '../types';
import StaticChart from 'assets/png/chart/static-chart.png';
import Img from 'react-optimized-image';

type MarketInfoProps = {
	market: string;
};

const MarketInfo: FC<MarketInfoProps> = ({ market }) => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const otherFuturesMarkets =
		futuresMarkets.filter((marketAsset) => marketAsset.asset !== market) ?? [];

	const futuresPositionQuery = useGetFuturesPositionForAccount();
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const baseCurrencyKey = market as CurrencyKey;

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
			<AssetsImage src={StaticChart} alt="" webp={true} />
			{/* <TVChart baseCurrencyKey={baseCurrencyKey} quoteCurrencyKey={Synths.sUSD} /> */}
			<UserInfo marketAsset={baseCurrencyKey} />
			<FuturesPositionsTable
				futuresMarkets={otherFuturesMarkets}
				futuresPositionHistory={futuresPositionHistory}
			/>
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 48px;
`;

const OverlayContainer = styled.div`
	position: relative;
	width: 50%;
	overflow: hidden;
`;

const Overlay = styled.div`
	.overlay {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100%;
		width: 100%;
		opacity: 0;
		transition: 0.5s ease-in-out;
		color: white;
	}
`;

const StyledImage = styled.img`
	display: block;
	width: 100%;
	height: auto;
`;

const AssetsImage = styled(Img)`
	width: 100%;
	border-radius: 16px;
`;

export default MarketInfo;
