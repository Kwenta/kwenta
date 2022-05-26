import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TabPanel } from 'components/Tab';
import TabButton from 'components/Button/TabButton';
import SpotHistoriesTable from '../SpotHistoriesTable';
import Transactions from '../Transactions';

enum HistoriesTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Histories: FC = () => {
	const { t } = useTranslation();

	const [activeMarketsTab, setActiveMarketsTab] = useState<HistoriesTab>(HistoriesTab.SPOT);

	const HISTORIES_TABS = useMemo(
		() => [
			{
				name: HistoriesTab.FUTURES,
				label: t('dashboard.overview.histories-tabs.futures'),
				active: activeMarketsTab === HistoriesTab.FUTURES,
				disabled: true,
				onClick: () => {
					setActiveMarketsTab(HistoriesTab.FUTURES);
				},
			},
			{
				name: HistoriesTab.SPOT,
				label: t('dashboard.overview.histories-tabs.spot'),
				active: activeMarketsTab === HistoriesTab.SPOT,
				onClick: () => {
					setActiveMarketsTab(HistoriesTab.SPOT);
				},
			},
		],
		[activeMarketsTab, t]
	);

	return (
		<>
			<TabButtonsContainer>
				{HISTORIES_TABS.map(({ name, label, active, disabled, onClick }) => (
					<TabButton
						key={name}
						title={label}
						active={active}
						onClick={onClick}
						disabled={disabled}
					/>
				))}
			</TabButtonsContainer>
			<TabPanel name={HistoriesTab.FUTURES} activeTab={activeMarketsTab}></TabPanel>

			<TabPanel name={HistoriesTab.SPOT} activeTab={activeMarketsTab}>
				<SpotHistoriesTable />
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

export default Histories;
