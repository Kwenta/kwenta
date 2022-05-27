import React from 'react';
import styled from 'styled-components';

import MainTab from './OverviewTabs';
import LowerTab from './UserTabs';
import { SectionSeparator } from './common';
import { FuturesPosition } from 'queries/futures/types';

type MobileTradeProps = {
	position: FuturesPosition | null;
};

const MobileTrade: React.FC<MobileTradeProps> = () => {
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
