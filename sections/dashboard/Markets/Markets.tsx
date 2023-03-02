import { FC, useState } from 'react';

import { TabPanel } from 'components/Tab';

import FuturesMarketsTable from '../FuturesMarketsTable';

export enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Markets: FC = () => {
	const [activeMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	return (
		<>
			<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
				<FuturesMarketsTable />
			</TabPanel>
		</>
	);
};

export default Markets;
