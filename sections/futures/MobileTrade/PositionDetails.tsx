import React from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { currentMarketState, positionState } from 'store/futures';
import { SectionHeader, SectionSeparator, SectionTitle } from './common';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { Synths } from 'constants/currency';
import PositionCard from '../PositionCard';

const PositionDetails = () => {
	const position = useRecoilValue(positionState);
	const marketAsset = useRecoilValue(currentMarketState);

	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = React.useMemo(
		() => (exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null),
		[exchangeRatesQuery.isSuccess, exchangeRatesQuery.data]
	);

	const marketAssetRate = React.useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, marketAsset, Synths.sUSD),
		[exchangeRates, marketAsset]
	);

	return position ? (
		<PositionDetailsContainer>
			<SectionHeader>
				<SectionTitle>Open Position</SectionTitle>
			</SectionHeader>
			<PositionCard mobile currencyKeyRate={marketAssetRate} />
		</PositionDetailsContainer>
	) : (
		<SectionSeparator />
	);
};

const PositionDetailsContainer = styled.div`
	margin: 15px;
`;

export default PositionDetails;
