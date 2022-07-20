import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';

import FuturesHistoryTable from '../FuturesHistoryTable';
import SpotHistoryTable from '../SpotHistoryTable';

enum HistoryTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const History: FC = () => {
	const { t } = useTranslation();

	const [activeMarketsTab, setActiveMarketsTab] = useState<HistoryTab>(HistoryTab.FUTURES);

	const HISTORY_TABS = useMemo(
		() => [
			{
				name: HistoryTab.FUTURES,
				label: t('dashboard.history.tabs.futures'),
				active: activeMarketsTab === HistoryTab.FUTURES,
				onClick: () => {
					setActiveMarketsTab(HistoryTab.FUTURES);
				},
			},
			{
				name: HistoryTab.SPOT,
				label: t('dashboard.history.tabs.spot'),
				active: activeMarketsTab === HistoryTab.SPOT,
				onClick: () => {
					setActiveMarketsTab(HistoryTab.SPOT);
				},
			},
		],
		[activeMarketsTab, t]
	);

	return (
		<>
			<TabButtonsContainer>
				{HISTORY_TABS.map(({ name, label, active, onClick }) => (
					<TabButton key={name} title={label} active={active} onClick={onClick} />
				))}
			</TabButtonsContainer>
			<TabPanel name={HistoryTab.FUTURES} activeTab={activeMarketsTab}>
				<FuturesHistoryTable></FuturesHistoryTable>
			</TabPanel>

			<TabPanel name={HistoryTab.SPOT} activeTab={activeMarketsTab}>
				<SpotHistoryTable />
			</TabPanel>
		</>
	);
};

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	& > button {
		height: 38px;
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

export default History;
