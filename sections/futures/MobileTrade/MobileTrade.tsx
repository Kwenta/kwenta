import React from 'react';

import OverviewTabs from './OverviewTabs';
import UserTabs from './UserTabs';
import MarketsDropdown from '../Trade/MarketsDropdown';
import PositionDetails from './PositionDetails';

const MobileTrade: React.FC = () => (
	<div>
		<MarketsDropdown mobile />
		<OverviewTabs />
		<PositionDetails />
		<UserTabs />
	</div>
);

export default MobileTrade;
