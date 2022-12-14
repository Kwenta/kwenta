import { FunctionComponent } from 'react';

import { CrossMarginIcon, IsolatedMarginIcon } from 'components/Nav/FuturesIcon';
import { COMPETITION_ENABLED } from 'constants/competition';
import { CROSS_MARGIN_ENABLED, DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';

export type Badge = {
	i18nLabel: string;
	color: 'yellow' | 'red' | 'neon';
};

export type SubMenuLink = {
	i18nLabel: string;
	link: string;
	badge?: Badge[];
	Icon?: FunctionComponent<any>;
};

export type MenuLink = {
	i18nLabel: string;
	link: string;
	links?: SubMenuLink[] | null;
};

export type MenuLinks = MenuLink[];

export const HOMEPAGE_MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'homepage.nav.markets',
		link: ROUTES.Markets.Home('cross_margin'),
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
];

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
		link: ROUTES.Dashboard.Earn,
		i18nLabel: 'dashboard.tabs.earn',
	},
];

export const getMenuLinks = (isMobile: boolean): MenuLinks => [
	{
		i18nLabel: 'header.nav.dashboard',
		link: ROUTES.Dashboard.Home,
		links: isMobile ? DASHBOARD_LINKS : null,
	},
	{
		i18nLabel: 'header.nav.markets',
		link: ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE),
		links: CROSS_MARGIN_ENABLED
			? [
					{
						link: ROUTES.Markets.Home('isolated_margin'),
						i18nLabel: 'header.nav.isolated-margin',
						Icon: IsolatedMarginIcon,
					},
					{
						link: ROUTES.Markets.Home('cross_margin'),
						i18nLabel: 'header.nav.cross-margin',
						badge: [
							{
								i18nLabel: 'header.nav.beta-badge',
								color: 'yellow',
							},
							{
								i18nLabel: 'header.nav.reward-badge',
								color: 'neon',
							},
						],
						Icon: CrossMarginIcon,
					},
			  ]
			: null,
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
];

export const DESKTOP_NAV_LINKS = getMenuLinks(false);
export const MOBILE_NAV_LINKS = getMenuLinks(true);

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
