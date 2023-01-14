import React from 'react';

import { Pane } from 'components/mobile/futures';
import TradesHistoryTable from 'sections/futures/TradingHistory/TradesHistoryTable';

const TradesTab: React.FC = () => {
	return (
		<Pane>
			<TradesHistoryTable mobile />
		</Pane>
	);
};
export default TradesTab;
