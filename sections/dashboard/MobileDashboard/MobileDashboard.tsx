import React from 'react';

import FuturesMarkets from './FuturesMarkets';
import OpenPositions from './OpenPositions';
import Portfolio from './Portfolio';

const MobileDashboard: React.FC = () => (
	<div>
		<Portfolio />
		<OpenPositions />
		<FuturesMarkets />
	</div>
);

export default MobileDashboard;
