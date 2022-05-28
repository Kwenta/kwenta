import React from 'react';
import styled from 'styled-components';

import OverviewTabs from './OverviewTabs';
import UserTabs from './UserTabs';
import { SectionSeparator } from './common';
import { FuturesPosition } from 'queries/futures/types';

type MobileTradeProps = {
	position: FuturesPosition | null;
};

const MobileTrade: React.FC<MobileTradeProps> = () => {
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
