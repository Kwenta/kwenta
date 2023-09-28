import { useRouter } from 'next/router'
import { FC, ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import NavLink from 'components/Nav/NavLink'
import { TabList, TabPanel } from 'components/Tab'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'
import AppLayout from 'sections/shared/Layout/AppLayout'
import { useAppSelector } from 'state/hooks'
import { selectStakingMigrationRequired } from 'state/staking/selectors'
import { selectStartMigration } from 'state/stakingMigration/selectors'
import { LeftSideContent, PageContent } from 'styles/common'

import Links from './Links'

enum Tab {
	Overview = 'overview',
	History = 'history',
	Markets = 'markets',
	Governance = 'governance',
	Stake = 'staking',
	Migrate = 'migrate',
}

const Tabs = Object.values(Tab)

const DashboardLayout: FC<{ children?: ReactNode }> = ({ children }) => {
	const { t } = useTranslation()
	const router = useRouter()
	const stakingMigrationRequired = useAppSelector(selectStakingMigrationRequired)
	const startMigration = useAppSelector(selectStartMigration)

	const tabQuery = useMemo(() => {
		if (router.pathname) {
			const tab = router.pathname.split('/')[2] as Tab
			if (Tabs.includes(tab)) return tab
		}

		return null
	}, [router.pathname])

	const activeTab = tabQuery ?? Tab.Overview

	const TABS = useMemo(
		() => [
			{
				name: Tab.Overview,
				label: t('dashboard.tabs.overview'),
				active: activeTab === Tab.Overview,
				href: ROUTES.Dashboard.Home,
			},
			{
				name: Tab.History,
				label: t('dashboard.tabs.history'),
				active: activeTab === Tab.History,
				href: ROUTES.Dashboard.History,
			},
			{
				name: Tab.Markets,
				label: t('dashboard.tabs.markets'),
				active: activeTab === Tab.Markets,
				disabled: false,
				href: ROUTES.Dashboard.Markets,
			},
			{
				name: Tab.Stake,
				label: t('dashboard.tabs.staking'),
				active: activeTab === Tab.Stake,
				href: ROUTES.Dashboard.Stake,
				hidden: startMigration,
			},
			{
				name: Tab.Migrate,
				label: t('dashboard.tabs.migrate'),
				active: activeTab === Tab.Migrate,
				href: ROUTES.Dashboard.Migrate,
				hidden: !stakingMigrationRequired && !startMigration,
			},
			{
				name: Tab.Governance,
				label: t('dashboard.tabs.governance'),
				active: activeTab === Tab.Governance,
				href: EXTERNAL_LINKS.Docs.Governance,
				external: true,
			},
		],
		[t, activeTab, startMigration, stakingMigrationRequired]
	)

	const visibleTabs = TABS.filter(({ hidden }) => !hidden)

	return (
		<AppLayout>
			<DesktopOnlyView>
				<PageContent>
					<StyledFullHeightContainer>
						<StyledLeftSideContent>
							<StyledTabList>
								<TabGroupTitle>{t('dashboard.titles.trading')}</TabGroupTitle>
								{visibleTabs.slice(0, 3).map(({ name, label, active, ...rest }) => (
									<NavLink key={name} title={label} isActive={active} {...rest} />
								))}

								<TabGroupTitle>{t('dashboard.titles.community')}</TabGroupTitle>
								{visibleTabs.slice(3).map(({ name, label, active, ...rest }) => (
									<NavLink key={name} title={label} isActive={active} {...rest} />
								))}
							</StyledTabList>
							<Links />
						</StyledLeftSideContent>
						<MainContent>
							<TabPanel name={activeTab} activeTab={activeTab}>
								{children}
							</TabPanel>
						</MainContent>
					</StyledFullHeightContainer>
				</PageContent>
			</DesktopOnlyView>
			<MobileOrTabletView>{children}</MobileOrTabletView>
		</AppLayout>
	)
}

const StyledTabList = styled(TabList)`
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
`

const TabGroupTitle = styled.div`
	margin-bottom: 10px;
	margin-left: 14px;
	font-size: 13px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.black};
	color: ${(props) => props.theme.colors.selectedTheme.yellow};

	&:not(:first-of-type) {
		margin-top: 65px;
	}
`

const MainContent = styled.div`
	overflow-y: scroll;
	scrollbar-width: none;
	margin: 0 auto;
	width: 100%;
	max-width: 1080px;
`

const StyledLeftSideContent = styled(LeftSideContent)`
	padding-top: 15px;
`

const StyledFullHeightContainer = styled.div`
	display: grid;
	grid-template-columns: 165px 1fr 150px;
	height: 100%;
	padding: 0 15px;
`

export default DashboardLayout
