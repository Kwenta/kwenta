import React, { useMemo } from 'react'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { selectAllConditionalOrders, selectPendingOrdersCount } from 'state/futures/selectors'
import { selectActiveSmartPositionsCount } from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'

import ConditionalOrdersTab from './ConditionalOrdersTab'
import OrdersTab from './OrdersTab'
import PositionsTab from './PositionsTab'
import TradesTab from './TradesTab'

const UserTabs: React.FC = () => {
	const [activeTab, setActiveTab] = React.useState(0)
	const pendingOrdersCount = useAppSelector(selectPendingOrdersCount)
	const conditionalOrders = useAppSelector(selectAllConditionalOrders)
	const smartPositionsCount = useAppSelector(selectActiveSmartPositionsCount)

	const TABS = useMemo(() => {
		return [
			{
				title: 'Positions',
				component: <PositionsTab />,
				badge: smartPositionsCount,
			},
			{
				title: 'Pending',
				component: <OrdersTab />,
				badge: pendingOrdersCount,
			},
			{
				title: 'Orders',
				component: <ConditionalOrdersTab />,
				badge: conditionalOrders.length,
			},
			{
				title: 'Trades',
				component: <TradesTab />,
			},
		]
	}, [conditionalOrders.length, pendingOrdersCount, smartPositionsCount])

	return (
		<Container>
			<UserTabsContainer>
				<TabButtonsContainer>
					{TABS.map(({ title, badge }, i) => (
						<TabButton
							key={title}
							title={title}
							badgeCount={badge}
							active={activeTab === i}
							onClick={() => setActiveTab(i)}
							flat
						/>
					))}
				</TabButtonsContainer>
			</UserTabsContainer>
			<div>{TABS[activeTab].component}</div>
		</Container>
	)
}

const Container = styled.div`
	min-height: 390px;
`

const UserTabsContainer = styled.div`
	width: 100%;
	overflow: scroll;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const TabButtonsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`

export default UserTabs
