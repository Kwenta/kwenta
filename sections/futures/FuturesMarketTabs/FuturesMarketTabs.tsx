import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { TabPanel } from 'components/Tab';

import SegmentedControl from '../../../components/SegmentedControl';
import { activeTabState } from '../../../store/futures';
import TradesHistoryTable from '../TradingHistory/TradesHistoryTable';
import FuturesMarketTab from './FuturesMarketTab';

const FuturesMarketTabs: FC = () => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useRecoilState(activeTabState);

	const DETAIL_TABS = [
		t('futures.market.sidebar-tab.markets'),
		t('futures.market.sidebar-tab.history'),
	];

	return (
		<>
			<StyledSegmentedControl
				values={DETAIL_TABS}
				selectedIndex={activeTab}
				onChange={setActiveTab}
			/>
			<TabPanel name={DETAIL_TABS[0]} activeTab={DETAIL_TABS[activeTab]}>
				<FuturesMarketTab />
			</TabPanel>
			<TabPanel name={DETAIL_TABS[1]} activeTab={DETAIL_TABS[activeTab]}>
				<TradesHistoryTable />
			</TabPanel>
		</>
	);
};

const StyledSegmentedControl = styled(SegmentedControl)`
	margin-bottom: 16px;
`;

export default FuturesMarketTabs;
