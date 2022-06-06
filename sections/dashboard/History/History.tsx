import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import SpotHistoryTable from '../SpotHistoryTable';

enum HistoryTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const History: FC = () => {
	const { t } = useTranslation();

	const [activeMarketsTab, setActiveMarketsTab] = useState<HistoryTab>(HistoryTab.SPOT);

	const HISTORY_TABS = useMemo(
		() => [
			{
				name: HistoryTab.FUTURES,
				label: t('dashboard.overview.history-tabs.futures'),
				active: activeMarketsTab === HistoryTab.FUTURES,
				disabled: true,
				onClick: () => {
					setActiveMarketsTab(HistoryTab.FUTURES);
				},
			},
			{
				name: HistoryTab.SPOT,
				label: t('dashboard.overview.history-tabs.spot'),
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
				{HISTORY_TABS.map(({ name, label, active, disabled, onClick }) => (
					<TabButton
						key={name}
						title={label}
						active={active}
						onClick={onClick}
						disabled={disabled}
					/>
				))}
			</TabButtonsContainer>
			<TabPanel name={HistoryTab.FUTURES} activeTab={activeMarketsTab}></TabPanel>

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
