import React from 'react'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'

import FundingTab from './FundingTab'
import PriceTab from './PriceTab'
import TradesTab from './TradesTab'

const TABS = [
	{
		title: 'Price',
		component: <PriceTab />,
		nofill: true,
	},
	{
		title: 'Funding',
		component: <FundingTab />,
		nofill: true,
	},
	{
		title: 'History',
		component: <TradesTab />,
	},
]

const OverviewTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0)

	return (
		<div>
			<MainTabButtonsContainer>
				{TABS.map(({ title, nofill }, i) => (
					<TabButton
						key={title}
						title={title}
						active={activeTab === i}
						onClick={() => setActiveTab(i)}
						nofill={nofill}
						flat
					/>
				))}
			</MainTabButtonsContainer>
			{TABS[activeTab].component}
		</div>
	)
}

const MainTabButtonsContainer = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-gap: 0;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
`

export default OverviewTabs
