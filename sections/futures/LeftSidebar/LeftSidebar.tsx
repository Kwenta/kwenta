import React from 'react';
import styled from 'styled-components';

import { LeftSideContent } from 'styles/common';

import FuturesMarketTabs from '../FuturesMarketTabs';
import SkewInfo from '../TradingHistory/SkewInfo';

const TradingHistory: React.FC = React.memo(() => (
	<StyledLeftSideContent>
		<Panel>
			<SkewInfo />
			<FuturesMarketTabs />
		</Panel>
	</StyledLeftSideContent>
));

export default TradingHistory;

const StyledLeftSideContent = styled(LeftSideContent)`
	width: 100%;

	@media (max-width: 1200px) {
		display: none;
	}
`;

const Panel = styled.div`
	padding-bottom: 20px;
`;
