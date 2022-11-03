import React from 'react';
import styled from 'styled-components';

import { LeftSideContent } from 'styles/common';

import MarketsDropdown from '../Trade/MarketsDropdown';
import SkewInfo from '../TradingHistory/SkewInfo';
import TradesHistoryTable from '../TradingHistory/TradesHistoryTable';

const FuturesLeftSideBar: React.FC = React.memo(() => (
	<StyledLeftSideContent>
		<MarketsDropdown />
		<SkewInfo />
		<TradesHistoryTable />
	</StyledLeftSideContent>
));

export default FuturesLeftSideBar;

const StyledLeftSideContent = styled(LeftSideContent)`
	width: 100%;
	padding-bottom: 20px;

	@media (max-width: 1200px) {
		display: none;
	}
`;
