import React from 'react';
import styled from 'styled-components';

import AccountIcon from 'assets/svg/app/account.svg';
import PriceIcon from 'assets/svg/app/price.svg';
import StatsIcon from 'assets/svg/app/stats.svg';
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg';
import TabButton from 'components/Button/TabButton';
import media from 'styles/media';

import AccountTab from './AccountTab';
import PriceTab from './PriceTab';
import StatsTab from './StatsTab';
import TradesTab from './TradesTab';

const TABS = [
	{
		title: 'Price',
		component: <PriceTab />,
		icon: <PriceIcon />,
		nofill: true,
	},
	{
		title: 'Account',
		component: <AccountTab />,
		icon: <AccountIcon />,
	},
	{
		title: 'Trades',
		component: <TradesTab />,
		icon: <OrderHistoryIcon width={18} height={18} />,
	},
	{
		title: 'Stats',
		component: <StatsTab />,
		icon: <StatsIcon />,
		nofill: true,
	},
];

const OverviewTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<OverviewTabsContainer>
			{TABS[activeTab].component}
			<MainTabButtonsContainer>
				{TABS.map(({ title, icon, nofill }, i) => (
					<TabButton
						key={title}
						title={title}
						active={activeTab === i}
						onClick={() => setActiveTab(i)}
						icon={icon}
						vertical
						nofill={nofill}
					/>
				))}
			</MainTabButtonsContainer>
		</OverviewTabsContainer>
	);
};

const OverviewTabsContainer = styled.div`
	margin-top: 55px;

	${media.lessThan('md')`
		margin-top: 0px;
	`}
`;

const MainTabButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-column-gap: 15px;
	overflow: auto;
	padding: 0 15px;
`;

export default OverviewTabs;
