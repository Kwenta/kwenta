import React from 'react';
import { Pane, SectionHeader, SectionTitle } from '../common';

import MarketDetails from 'sections/futures/MarketDetails';

const StatsTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>
				<SectionTitle>Market Stats</SectionTitle>
			</SectionHeader>
			<MarketDetails mobile />
		</Pane>
	);
};

export default StatsTab;
