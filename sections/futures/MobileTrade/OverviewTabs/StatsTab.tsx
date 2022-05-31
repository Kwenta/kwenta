import React from 'react';
import { Pane, SectionHeader } from '../common';

import MarketDetails from 'sections/futures/MarketDetails';

const StatsTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>Market Stats</SectionHeader>
			<MarketDetails mobile />
		</Pane>
	);
};

export default StatsTab;
