import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import TabButton from 'components/Button/TabButton';
import { DesktopOnlyView } from 'components/Media';
import { TabPanel } from 'components/Tab';

import FuturesMarketsTable from '../FuturesMarketsTable';
import { TabButtonsContainer } from '../History/History';

export enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Markets: FC = () => {
	const { t } = useTranslation();

	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const MARKETS_TABS = useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.markets-tabs.futures'),
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.FUTURES);
				},
			},
		],
		[activeMarketsTab, t]
	);

	return (
		<>
			<DesktopOnlyView>
				<TabButtonsContainer>
					{MARKETS_TABS.map(({ name, label, active, onClick }) => (
						<TabButton key={name} title={label} active={active} onClick={onClick} />
					))}
				</TabButtonsContainer>
			</DesktopOnlyView>

			<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
				<FuturesMarketsTable />
			</TabPanel>
		</>
	);
};

export default Markets;
