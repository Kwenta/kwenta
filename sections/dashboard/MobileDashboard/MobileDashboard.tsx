import React from 'react';
import FuturesMarkets from './FuturesMarkets';
import OpenPositions from './OpenPositions';

// Structure:
// - Portfolio Overview + Chart
// - Open Positions

const MobileDashboard = () => {
	return (
		<div>
			<OpenPositions />
			<FuturesMarkets />
		</div>
	);
};

export default MobileDashboard;
