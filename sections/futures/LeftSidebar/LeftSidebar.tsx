import React from 'react';
import styled from 'styled-components';

import FuturesMarketTabs from '../FuturesMarketTabs';
import SkewInfo from '../TradingHistory/SkewInfo';

const TradingHistory: React.FC = React.memo(() => {
	return (
		<Panel>
			<SkewInfo />
			<FuturesMarketTabs />
		</Panel>
	);
});

export default TradingHistory;

const Panel = styled.div`
	padding-bottom: 20px;
`;
