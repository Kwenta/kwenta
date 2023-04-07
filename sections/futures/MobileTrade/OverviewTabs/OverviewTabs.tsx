import React from 'react';
import styled from 'styled-components';

import TabButton from 'components/Button/TabButton';
import TradeBalance from 'sections/futures/Trade/TradeBalance';

import PriceTab from './PriceTab';
import TradesTab from './TradesTab';

const TABS = [
	{
		title: 'Price',
		component: <PriceTab />,
		nofill: true,
	},
	{
		title: 'Trades',
		component: <TradesTab />,
	},
];

const OverviewTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<OverviewTabsContainer>
			<TradeBalance />
			<MainTabButtonsContainer>
				{TABS.map(({ title, nofill }, i) => (
					<TabButton
						key={title}
						title={title}
						active={activeTab === i}
						onClick={() => setActiveTab(i)}
						vertical
						nofill={nofill}
					/>
				))}
			</MainTabButtonsContainer>
			{TABS[activeTab].component}
		</OverviewTabsContainer>
	);
};

const OverviewTabsContainer = styled.div``;

const MainTabButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	overflow: auto;

	> button {
		border-radius: 0;
		border-left: none;
		&:last-of-type {
			border-right: none;
		}
	}
`;

export default OverviewTabs;
