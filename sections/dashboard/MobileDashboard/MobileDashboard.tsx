import React from 'react';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';

import FuturesMarkets from './FuturesMarkets';
import OpenPositions from './OpenPositions';
import Portfolio from './Portfolio';
import SpotMarkets from './SpotMarkets';

enum PositionsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const MobileDashboard: React.FC = () => {
	const [activePositionsTabInParent, setActivePositionsTabInParent] = React.useState<PositionsTab>(
		PositionsTab.FUTURES
	);

	return (
		<div>
			<CompetitionBanner />
			<Portfolio />
			<OpenPositions
				activePositionsTabInParent={activePositionsTabInParent}
				setActivePositionsTabInParent={setActivePositionsTabInParent}
			/>
			{activePositionsTabInParent === PositionsTab.FUTURES && <FuturesMarkets />}
			{activePositionsTabInParent === PositionsTab.SPOT && <SpotMarkets />}
		</div>
	);
};

export default MobileDashboard;
