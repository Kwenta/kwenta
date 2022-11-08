import React from 'react';

import TradesHistoryTable from 'sections/futures/TradingHistory/TradesHistoryTable';

import { Pane } from '../common';

const TradesTab: React.FC = () => {
	return (
		<Pane>
			<TradesHistoryTable mobile />
		</Pane>
	);
};
export default TradesTab;
