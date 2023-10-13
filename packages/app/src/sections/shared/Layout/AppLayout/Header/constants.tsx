import { FuturesMarginType } from '@kwenta/sdk/types'
import { FunctionComponent } from 'react'

import { COMPETITION_ENABLED } from 'constants/competition'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'

export type Badge = {
	i18nLabel: string
	color: 'yellow' | 'red' | 'gray'
}

export type SubMenuLink = {
	i18nLabel: string
	link: string
	badge?: Badge[]
	Icon?: FunctionComponent<any>
	externalLink?: boolean
}

export type MenuLink = {
	i18nLabel: string
	link: string
	links?: SubMenuLink[] | null
	hidden?: boolean
}

export type MenuLinks = MenuLink[]

export const HOMEPAGE_MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'homepage.nav.markets',
		link: ROUTES.Markets.Home(FuturesMarginType.SMART_MARGIN),
	},
	{
		i18nLabel: 'homepage.nav.stats',
		link: ROUTES.Stats.Home,
	},
	{
		i18nLabel: 'homepage.nav.governance.title',
		link: ROUTES.Home.Root,
	},
	{
		i18nLabel: 'homepage.nav.blog',
		link: EXTERNAL_LINKS.Social.Mirror,
	},
]

const DASHBOARD_LINKS = [
	{
		link: ROUTES.Dashboard.Home,
		i18nLabel: 'dashboard.tabs.overview',
	},
	{
		link: ROUTES.Dashboard.History,
		i18nLabel: 'dashboard.tabs.history',
	},
	{
		link: ROUTES.Dashboard.Markets,
		i18nLabel: 'dashboard.tabs.markets',
	},
	{
		link: ROUTES.Dashboard.Stake,
		i18nLabel: 'dashboard.tabs.staking',
	},
	{
		link: ROUTES.Dashboard.Migrate,
		i18nLabel: 'dashboard.tabs.migrate',
	},
]

export const getMenuLinks = (isMobile: boolean): MenuLinks => [
	{
		i18nLabel: 'header.nav.dashboard',
		link: ROUTES.Dashboard.Home,
		links: isMobile ? DASHBOARD_LINKS : null,
	},
	{
		i18nLabel: 'header.nav.markets',
		link: ROUTES.Markets.Home(FuturesMarginType.SMART_MARGIN),
	},
	{
		i18nLabel: 'header.nav.exchange',
		link: ROUTES.Exchange.Home,
	},
	{
		i18nLabel: 'header.nav.leaderboard',
		link: ROUTES.Leaderboard.Home,
		links: COMPETITION_ENABLED
			? [
					{
						link: ROUTES.Leaderboard.Home,
						i18nLabel: 'header.nav.leaderboard-alltime',
					},
					{
						link: ROUTES.Leaderboard.Competition('1'),
						i18nLabel: 'header.nav.competition-round-1',
					},
					{
						link: ROUTES.Leaderboard.Competition('2'),
						i18nLabel: 'header.nav.competition-round-2',
					},
			  ]
			: null,
	},
	{
		i18nLabel: 'header.nav.referrals',
		link: ROUTES.Referrals.Home,
	},
]

export const DESKTOP_NAV_LINKS = getMenuLinks(false).filter((m) => !m.hidden)
export const MOBILE_NAV_LINKS = getMenuLinks(true).filter((m) => !m.hidden)

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = []
