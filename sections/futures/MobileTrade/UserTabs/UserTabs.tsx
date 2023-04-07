import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';

import OrdersTab from './OrdersTab';
import PositionsTab from './PositionsTab';
import TradesTab from './TradesTab';
import TransfersTab from './TransfersTab';

const TABS = [
	{
		title: 'Position',
		component: <PositionsTab />,
	},
	{
		title: 'Orders',
		component: <OrdersTab />,
	},
	{
		title: 'Trades',
		component: <TradesTab />,
	},
	{
		title: 'Transfers',
		component: <TransfersTab />,
	},
];

const UserTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<UserTabsContainer>
			<TabButtonsContainer>
				{TABS.map(({ title }, i) => (
					<TabButton
						key={title}
						title={title}
						active={activeTab === i}
						onClick={() => setActiveTab(i)}
						flat
					/>
				))}
			</TabButtonsContainer>
			<div>{TABS[activeTab].component}</div>
		</UserTabsContainer>
	);
};

const UserTabsContainer = styled.div`
	min-height: 390px;
`;

const TabButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	overflow: auto;
`;

export default UserTabs;
