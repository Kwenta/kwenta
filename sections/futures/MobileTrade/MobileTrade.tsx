import React from 'react';
import styled from 'styled-components';

import OverviewTabs from './OverviewTabs';
import UserTabs from './UserTabs';
import MarketsDropdown from '../Trade/MarketsDropdown';
import PositionDetails from './PositionDetails';

const MobileTrade: React.FC = () => (
	<MobileTradeContainer>
		<MarketsDropdown mobile />
		<OverviewTabs />
		<PositionDetails />
		<UserTabs />
	</MobileTradeContainer>
);

const MobileTradeContainer = styled.div``;

export default MobileTrade;
