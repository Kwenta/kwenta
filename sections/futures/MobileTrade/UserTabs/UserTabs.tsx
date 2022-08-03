import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';

import OpenPositionTab from './OpenPositionTab';
import OrdersTab from './OrdersTab';
import TradesTab from './TradesTab';
import TransfersTab from './TransfersTab';

const TABS = [
	{
		title: 'Position',
		component: <OpenPositionTab />,
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
					/>
				))}
			</TabButtonsContainer>
			<div>{TABS[activeTab].component}</div>
		</UserTabsContainer>
	);
};

const UserTabsContainer = styled.div`
	padding: 0 15px;
	min-height: 390px;
`;

const TabButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-column-gap: 15px;
	margin-bottom: 15px;
	overflow: auto;
`;

export default UserTabs;
