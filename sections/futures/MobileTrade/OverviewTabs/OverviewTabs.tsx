import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';

import AccountTab from './AccountTab';
import PriceTab from './PriceTab';
import StatsTab from './StatsTab';
import TradesTab from './TradesTab';

const TABS = [
	{
		title: 'Account',
		component: <AccountTab />,
	},
	{
		title: 'Price',
		component: <PriceTab />,
	},
	{
		title: 'Trades',
		component: <TradesTab />,
	},
	{
		title: 'Stats',
		component: <StatsTab />,
	},
];

const OverviewTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<MainTabContainer>
			<div className="pane">{TABS[activeTab].component}</div>
			<MainTabButtonsContainer>
				{TABS.map(({ title }, i) => (
					<TabButton
						key={title}
						title={title}
						active={activeTab === i}
						onClick={() => setActiveTab(i)}
					/>
				))}
			</MainTabButtonsContainer>
		</MainTabContainer>
	);
};

const MainTabContainer = styled.div`
	.pane {
		min-height: 313px;
	}
`;

const MainTabButtonsContainer = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 0 15px;

	& > button {
		flex: 1;
		&:not(:last-child) {
			margin-right: 10px;
		}
	}
`;

export default OverviewTabs;
