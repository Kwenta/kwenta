import useSynthetixQueries from '@synthetixio/queries';
import React from 'react';
import styled from 'styled-components';

import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';

import SpotMarketsTable from '../SpotMarketsTable';
import { HeaderContainer } from './common';

const SpotMarkets: React.FC = () => {
	const { useExchangeRatesQuery } = useSynthetixQueries();

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;

	return (
		<>
			<CustomHeaderContainer>
				<CustomSectionHeader>
					<SectionTitle>Spot Markets</SectionTitle>
				</CustomSectionHeader>
			</CustomHeaderContainer>

			<SpotMarketsTable exchangeRates={exchangeRates} />
		</>
	);
};

const CustomHeaderContainer = styled(HeaderContainer)`
	margin-bottom: 0px;
	padding-bottom: 0px;
`;

const CustomSectionHeader = styled(SectionHeader)`
	margin-bottom: 0px;
`;

export default SpotMarkets;
