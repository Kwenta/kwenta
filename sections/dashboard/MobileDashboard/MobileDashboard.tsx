import React from 'react';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';

import FuturesMarkets from './FuturesMarkets';
import OpenPositions from './OpenPositions';
import Portfolio from './Portfolio';

const MobileDashboard: React.FC = () => (
	<div>
		<CompetitionBanner />
		<Portfolio />
		<OpenPositions />
		<FuturesMarkets />
	</div>
);

export default MobileDashboard;
