import TabButton from 'components/Button/TabButton';
import React from 'react';
import styled from 'styled-components';

const tabMap = {
	account: '1',
	price: '2',
	trades: '3',
	stats: '4',
};

type AccTabs = keyof typeof tabMap;

const MainTab = () => {
	const [activeTab, setActiveTab] = React.useState<AccTabs>('account');

	return (
		<MainTabContainer>
			{tabMap[activeTab]}
			<MainTabButtonsContainer>
				{Object.entries(tabMap).map(([tab, value]) => (
					<TabButton key={tab} title={tab} onClick={() => setActiveTab(tab as AccTabs)} />
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
