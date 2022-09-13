import React from 'react';
import styled from 'styled-components';

import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { SectionHeader, SectionTitle } from 'sections/futures/MobileTrade/common';

import SpotMarketsTable from '../SpotMarketsTable';
import { HeaderContainer } from './common';

const SpotMarkets: React.FC = () => {
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

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
