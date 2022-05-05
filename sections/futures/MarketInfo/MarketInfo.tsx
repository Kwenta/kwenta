import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import styled from 'styled-components';
import useSynthetixQueries from '@synthetixio/queries';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { formatCurrency } from 'utils/formatters/number';

import UserInfo from '../UserInfo';
import { CurrencyKey } from 'constants/currency';
import MarketDetails from '../MarketDetails';
import { FuturesPosition } from 'queries/futures/types';
import PositionChart from '../PositionChart';
import { PotentialTrade } from '../types';

type MarketInfoProps = {
	market: string;
	position: FuturesPosition | null;
	openOrders: any[];
	potentialTrade: PotentialTrade | null;
	refetch(): void;
};

const MarketInfo: FC<MarketInfoProps> = ({
	market,
	position,
	openOrders,
	refetch,
	potentialTrade,
}) => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();

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
			<PositionChart marketAsset={baseCurrencyKey} potentialTrade={potentialTrade} />
			<UserInfo
				marketAsset={baseCurrencyKey}
				position={position}
				openOrders={openOrders}
				refetch={refetch}
			/>
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 48px;
`;

export default MarketInfo;
