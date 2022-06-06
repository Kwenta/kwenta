import React from 'react';
import styled from 'styled-components';

import OverviewTabs from './OverviewTabs';
import UserTabs from './UserTabs';
import { SectionSeparator } from './common';
import MarketsDropdown from '../Trade/MarketsDropdown';

const MobileTrade: React.FC = () => (
	<MobileTradeContainer>
		<MarketsDropdown mobile />
		<OverviewTabs />
		<SectionSeparator />
		<UserTabs />
	</MobileTradeContainer>
);

const MobileTradeContainer = styled.div``;

export default MobileTrade;
