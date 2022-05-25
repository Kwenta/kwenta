import TabButton from 'components/Button/TabButton';
import React from 'react';
import styled from 'styled-components';

const TABS = [
	{
		title: 'Account',
		component: <div />,
	},
	{
		title: 'Price',
		component: <div />,
	},
	{
		title: 'Trades',
		component: <div />,
	},
	{
		title: 'Stats',
		component: <div />,
	},
];

const MainTab = () => {
	const [activeTab, setActiveTab] = React.useState(0);

	return (
		<MainTabContainer>
			{TABS[activeTab].component}
			<MainTabButtonsContainer>
				{TABS.map(({ title }, i) => (
					<TabButton key={title} title={title} onClick={() => setActiveTab(i)} />
				))}
			</MainTabButtonsContainer>
		</MainTabContainer>
	);
};

const MainTabContainer = styled.div``;

const MainTabButtonsContainer = styled.div`
	display: flex;
	justify-content: space-between;

	& > button {
		max-width: 83px;
	}
`;

export default MainTab;
