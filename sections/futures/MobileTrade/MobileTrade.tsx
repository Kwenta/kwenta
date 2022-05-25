import React from 'react';
import styled from 'styled-components';

import MainTab from './OverviewTabs';
import LowerTab from './UserTabs';
import { SectionSeparator } from './common';

const MobileTrade = () => {
	return (
		<MobileTradeContainer>
			<MainTab />
			<SectionSeparator />
			<LowerTab />
		</MobileTradeContainer>
	);
};

const MobileTradeContainer = styled.div``;

export default MobileTrade;
