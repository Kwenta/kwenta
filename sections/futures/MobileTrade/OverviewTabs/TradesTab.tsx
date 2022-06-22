import React from 'react';
import TradesHistoryTable from 'sections/futures/TradingHistory/TradesHistoryTable';
import { Pane, SectionHeader } from '../common';

const TradesTab: React.FC = () => {
	return (
		<Pane>
			<SectionHeader>Trade History</SectionHeader>
			<TradesHistoryTable numberOfTrades={50} mobile />
		</Pane>
	);
};
export default TradesTab;
