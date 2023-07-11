import { FuturesMarginType } from '@kwenta/sdk/types'
import { useRouter } from 'next/router'
import React, { useMemo, useState, useCallback, useEffect, memo } from 'react'
import styled from 'styled-components'

import CalculatorIcon from 'assets/svg/futures/calculator-icon.svg'
import TransfersIcon from 'assets/svg/futures/deposit-withdraw-arrows.svg'
import OpenPositionsIcon from 'assets/svg/futures/icon-open-positions.svg'
import OrderHistoryIcon from 'assets/svg/futures/icon-order-history.svg'
import PositionIcon from 'assets/svg/futures/icon-position.svg'
import TabButton from 'components/Button/TabButton'
import Spacer from 'components/Spacer'
import { TabPanel } from 'components/Tab'
import ROUTES from 'constants/routes'
import useWindowSize from 'hooks/useWindowSize'
import {
	selectActiveSmartPositionsCount,
	selectActiveCrossMarginPositionsCount,
	selectFuturesType,
	selectMarketAsset,
	selectPosition,
	selectAllConditionalOrders,
} from 'state/futures/selectors'
import { fetchAllV2TradesForAccount } from 'state/futures/smartMargin/actions'
import { selectOpenDelayedOrders } from 'state/futures/smartMargin/selectors'
import { useAppSelector, useFetchAction, useAppDispatch } from 'state/hooks'
import { selectWallet } from 'state/wallet/selectors'

import ProfitCalculator from '../ProfitCalculator'
import Trades from '../Trades'
import Transfers from '../Transfers'

import ConditionalOrdersTable from './ConditionalOrdersTable'
import OpenDelayedOrdersTable from './OpenDelayedOrdersTable'
import PositionsTable from './PositionsTable'

enum FuturesTab {
	POSITION = 'position',
	ORDERS = 'orders',
	CONDITIONAL_ORDERS = 'conditional_orders',
	TRADES = 'trades',
	CALCULATOR = 'calculator',
	TRANSFERS = 'transfers',
	SHARE = 'share',
}

const FutureTabs = Object.values(FuturesTab)

const UserInfo: React.FC = memo(() => {
	const router = useRouter()
	const dispatch = useAppDispatch()
	const { lessThanWidth } = useWindowSize()

	const marketAsset = useAppSelector(selectMarketAsset)
	const position = useAppSelector(selectPosition)
	const smartPositionsCount = useAppSelector(selectActiveSmartPositionsCount)
	const crossPositionsCount = useAppSelector(selectActiveCrossMarginPositionsCount)
	const walletAddress = useAppSelector(selectWallet)

	const openOrders = useAppSelector(selectOpenDelayedOrders)
	const conditionalOrders = useAppSelector(selectAllConditionalOrders)
	const accountType = useAppSelector(selectFuturesType)

	useFetchAction(fetchAllV2TradesForAccount, {
		dependencies: [walletAddress, accountType, position?.position?.size.toString()],
		disabled: !walletAddress,
	})

	const [openProfitCalcModal, setOpenProfitCalcModal] = useState(false)

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = router.query.tab as FuturesTab
			if (FutureTabs.includes(tab)) {
				return tab
			}
		}
		return null
	}, [router])

	const activeTab = tabQuery ?? FuturesTab.POSITION

	const handleOpenProfitCalc = useCallback(() => {
		setOpenProfitCalcModal((s) => !s)
	}, [])

	const refetchTrades = useCallback(() => {
		dispatch(fetchAllV2TradesForAccount())
	}, [dispatch])

	useEffect(() => {
		refetchTrades()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [position?.marketKey])

	const TABS = useMemo(
		() => [
			{
				name: FuturesTab.POSITION,
				label: 'Positions',
				badge:
					accountType === FuturesMarginType.CROSS_MARGIN
						? crossPositionsCount
						: smartPositionsCount,
				active: activeTab === FuturesTab.POSITION,
				icon: <PositionIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Position(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.ORDERS,
				label: 'Pending',
				badge: openOrders?.length,
				active: activeTab === FuturesTab.ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Orders(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.CONDITIONAL_ORDERS,
				label: 'Orders',
				badge: conditionalOrders.length,
				disabled: accountType === FuturesMarginType.CROSS_MARGIN,
				active: activeTab === FuturesTab.CONDITIONAL_ORDERS,
				icon: <OpenPositionsIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.ConditionalOrders(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.TRADES,
				label: 'Trades',
				badge: undefined,
				active: activeTab === FuturesTab.TRADES,
				icon: <OrderHistoryIcon />,
				onClick: () =>
					router.push(ROUTES.Markets.Trades(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
			{
				name: FuturesTab.TRANSFERS,
				label: 'Transfers',
				badge: undefined,
				disabled: accountType === FuturesMarginType.CROSS_MARGIN, // leave this until we determine a disbaled state
				active: activeTab === FuturesTab.TRANSFERS,
				icon: <TransfersIcon width={11} height={11} />,
				onClick: () =>
					router.push(ROUTES.Markets.Transfers(marketAsset, accountType), undefined, {
						scroll: false,
					}),
			},
		],
		[
			activeTab,
			router,
			marketAsset,
			openOrders?.length,
			accountType,
			crossPositionsCount,
			smartPositionsCount,
			conditionalOrders.length,
		]
	)

	const filteredTabs = TABS.filter((tab) => !tab.disabled)

	return (
		<UserInfoContainer>
			<TabButtonsContainer>
				<TabLeft>
					{filteredTabs.map(({ name, label, badge, active, disabled, onClick, icon }) => (
						<TabButton
							inline
							key={name}
							title={label}
							badgeCount={badge}
							active={active}
							disabled={disabled}
							onClick={onClick}
							icon={icon}
						/>
					))}
				</TabLeft>
				<TabRight>
					{/* CALCULATOR tab */}
					<Spacer divider height={40} width={1} />
					<TabButton
						inline
						iconOnly={lessThanWidth('xl')}
						key={FuturesTab.CALCULATOR}
						title="Calculator"
						icon={<CalculatorIcon />}
						onClick={handleOpenProfitCalc}
					/>
				</TabRight>
			</TabButtonsContainer>

			<TabPanel name={FuturesTab.POSITION} activeTab={activeTab} fullHeight>
				<PositionsTable />
			</TabPanel>
			<TabPanel name={FuturesTab.ORDERS} activeTab={activeTab} fullHeight>
				<OpenDelayedOrdersTable />
			</TabPanel>
			<TabPanel name={FuturesTab.CONDITIONAL_ORDERS} activeTab={activeTab} fullHeight>
				<ConditionalOrdersTable />
			</TabPanel>
			<TabPanel name={FuturesTab.TRADES} activeTab={activeTab} fullHeight>
				<Trades />
			</TabPanel>
			<TabPanel name={FuturesTab.TRANSFERS} activeTab={activeTab} fullHeight>
				<Transfers />
			</TabPanel>

			{openProfitCalcModal && <ProfitCalculator setOpenProfitCalcModal={setOpenProfitCalcModal} />}
		</UserInfoContainer>
	)
})

const UserInfoContainer = styled.div`
	flex: 1;
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;
	overflow: hidden;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
`

const TabButtonsContainer = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-template-columns: repeat(2, 1fr);
	height: 40px;

	button {
		font-size: 13px;
	}
`

const TabLeft = styled.div`
	display: flex;
	justify-content: left;
`

const TabRight = styled.div`
	display: flex;
	justify-content: right;
`

export default UserInfo
