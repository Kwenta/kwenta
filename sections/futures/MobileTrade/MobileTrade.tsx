import React from 'react';

import MarketsDropdown from '../Trade/MarketsDropdown';
import OverviewTabs from './OverviewTabs';
import PositionDetails from './PositionDetails';
import UserTabs from './UserTabs';

const MobileTrade: React.FC = () => (
	<div>
		<MarketsDropdown mobile />
		<OverviewTabs />
		<PositionDetails />
		<UserTabs />
	</div>
);

export default MobileTrade;
