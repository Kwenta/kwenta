import React from 'react';

import TradesHistoryTable from 'sections/futures/TradingHistory/TradesHistoryTable';

import { Pane, SectionHeader, SectionTitle } from '../common';

const TradesTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>
				<SectionTitle>Trade History</SectionTitle>
			</SectionHeader>
			<TradesHistoryTable mobile />
		</Pane>
	);
};
export default TradesTab;
