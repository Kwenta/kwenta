import React from 'react';
import styled from 'styled-components';
import { SectionHeader } from 'sections/futures/MobileTrade/common';

const FuturesMarkets = () => {
	return (
		<div>
			<SectionHeader>Futures Markets</SectionHeader>
			<MarketStatsContainer></MarketStatsContainer>
		</div>
	);
};

const MarketStatsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

export default FuturesMarkets;
