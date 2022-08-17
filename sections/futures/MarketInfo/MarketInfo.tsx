import Head from 'next/head';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { currentMarketState, marketAssetRateState } from 'store/futures';
import { formatCurrency } from 'utils/formatters/number';
import { getDisplayAsset } from 'utils/futures';

import MarketDetails from '../MarketDetails';
import PositionChart from '../PositionChart';
import UserInfo from '../UserInfo';

const MarketInfo: FC = () => {
	const { t } = useTranslation();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const baseCurrencyKey = useRecoilValue(currentMarketState);
	const basePriceRate = useRecoilValue(marketAssetRateState);

	const marketName = getDisplayAsset(baseCurrencyKey);

	return (
		<Container>
			<Head>
				<title>
					{basePriceRate
						? t('futures.market.page-title-rate', {
								marketName,
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
