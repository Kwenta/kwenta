import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { selectFuturesType } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

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
		type: 'isolated_margin',
	},
];

const UserTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);
	const accountType = useAppSelector(selectFuturesType);

	return (
		<Container>
			<UserTabsContainer>
				<TabButtonsContainer>
					{TABS.filter(({ type }) => !type || type === accountType).map(({ title }, i) => (
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
	display: flex;
	justify-content: space-between;
`;

export default UserTabs;
