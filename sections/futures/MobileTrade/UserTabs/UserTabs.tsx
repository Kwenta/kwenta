import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import { FuturesAccountType } from 'queries/futures/subgraph';
import TradeIsolatedMargin from 'sections/futures/Trade/TradeIsolatedMargin';
import TradeCrossMargin from 'sections/futures/TradeCrossMargin';
import { selectFuturesType } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import OrdersTab from './OrdersTab';
import TradesTab from './TradesTab';
import TransfersTab from './TransfersTab';

const getTabs = (accountType: FuturesAccountType) => {
	const tabs = [
		{
			title: 'Position',
			component:
				accountType === 'isolated_margin' ? (
					<TradeIsolatedMargin isMobile />
				) : (
					<TradeCrossMargin isMobile />
				),
		},
		{
			title: 'Orders',
			component: <OrdersTab />,
		},
		{
			title: 'Trades',
			component: <TradesTab />,
		},
	];
	if (accountType === 'isolated_margin') {
		tabs.push({
			title: 'Transfers',
			component: <TransfersTab />,
		});
	}
	return tabs;
};

const UserTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);
	const accountType = useAppSelector(selectFuturesType);

	const tabs = getTabs(accountType);

	return (
		<UserTabsContainer>
			<TabButtonsContainer>
				{tabs.map(({ title }, i) => (
					<TabButton
						key={title}
						title={title}
						active={activeTab === i}
						onClick={() => setActiveTab(i)}
					/>
				))}
			</TabButtonsContainer>
			<div>{tabs[activeTab].component}</div>
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
