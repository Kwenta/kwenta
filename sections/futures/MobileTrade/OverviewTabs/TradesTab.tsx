import React from 'react';

import { Pane } from 'sections/futures/mobile';
import TradesHistoryTable from 'sections/futures/TradingHistory/TradesHistoryTable';

const TradesTab: React.FC = () => {
	return (
		<Pane>
			<TradesHistoryTable mobile />
		</Pane>
	);
};
export default TradesTab;
