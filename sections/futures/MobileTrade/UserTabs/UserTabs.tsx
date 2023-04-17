import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';

import ConditionalOrdersTab from './ConditionalOrdersTab';
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
		title: 'Pending',
		component: <OrdersTab />,
	},
	{
		title: 'Orders',
		component: <ConditionalOrdersTab />,
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
		<Container>
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
			</UserTabsContainer>
			<div>{TABS[activeTab].component}</div>
		</Container>
	);
};

const Container = styled.div`
	min-height: 390px;
`;

const UserTabsContainer = styled.div`
	width: 100%;
	overflow: scroll;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`;

const TabButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	grid-gap: 0;
`;

export default UserTabs;
