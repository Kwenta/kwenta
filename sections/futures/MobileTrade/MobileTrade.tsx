import React from 'react';

import MarketsDropdown from '../Trade/MarketsDropdown';
import OverviewTabs from './OverviewTabs';
import PositionDetails from './PositionDetails';
import UserTabs from './UserTabs';

const MobileTrade: React.FC = () => (
	<>
		<MarketsDropdown mobile />
		<OverviewTabs />
		<PositionDetails />
		<UserTabs />
	</>
);

export default MobileTrade;
