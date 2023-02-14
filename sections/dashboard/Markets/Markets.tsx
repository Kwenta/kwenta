import { FC, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { DesktopOnlyView } from 'components/Media';
import { TabPanel } from 'components/Tab';

import FuturesMarketsTable from '../FuturesMarketsTable';

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

const TabButtonsContainer = styled.div<{ mobile?: boolean }>`
	display: flex;
	margin-top: 16px;
	margin-bottom: 16px;

	margin-left: ${(props) => (props.mobile ? '16px' : '0')};

	& > button {
		height: 38px;
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 14px;
		}
	}
`;

export default Markets;
