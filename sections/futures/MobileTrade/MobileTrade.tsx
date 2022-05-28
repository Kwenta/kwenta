import React from 'react';
import styled from 'styled-components';

import OverviewTabs from './OverviewTabs';
import UserTabs from './UserTabs';
import { SectionSeparator } from './common';

const MobileTrade: React.FC = () => {
	return (
		<MobileTradeContainer>
			<OverviewTabs />
			<SectionSeparator />
			<UserTabs />
		</MobileTradeContainer>
	);
};

const MobileTradeContainer = styled.div``;

export default MobileTrade;
