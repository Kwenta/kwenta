import React from 'react';
import styled from 'styled-components';
import { SectionHeader } from 'sections/futures/MobileTrade/common';
import FuturesMarketsTable from '../FuturesMarketsTable';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';

const FuturesMarkets = () => {
	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];

	return (
		<div>
			<HeaderContainer>
				<SectionHeader>Futures Markets</SectionHeader>
				<MarketStatsContainer></MarketStatsContainer>
			</HeaderContainer>

			<FuturesMarketsTable futuresMarkets={futuresMarkets} />
		</div>
	);
};

const HeaderContainer = styled.div`
	padding: 15px;
`;

const MarketStatsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

export default FuturesMarkets;
