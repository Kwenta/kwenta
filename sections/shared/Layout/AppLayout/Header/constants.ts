import { FunctionComponent } from 'react';

import CrossMarginIcon from 'assets/svg/futures/cross-margin-icon.svg';
import IsolatedMarginIcon from 'assets/svg/futures/isolated-margin-icon.svg';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';

export type SubMenuLink = {
	i18nLabel: string;
	link: string;
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
		link: ROUTES.Home.History,
		i18nLabel: 'dashboard.tabs.history',
	},
	{
		link: ROUTES.Home.Markets,
		i18nLabel: 'dashboard.tabs.markets',
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
		links: [
			{
				link: ROUTES.Markets.Home('isolated_margin'),
				i18nLabel: 'header.nav.isolated-margin',
				Icon: IsolatedMarginIcon,
			},
			{
				link: ROUTES.Markets.Home('cross_margin'),
				i18nLabel: 'header.nav.cross-margin',
				Icon: CrossMarginIcon,
			},
		],
	},
	{
		i18nLabel: 'header.nav.exchange',
		link: ROUTES.Exchange.Home,
	},
	{
		i18nLabel: 'header.nav.leaderboard',
		link: ROUTES.Leaderboard.Home,
	},
];

export const DESKTOP_NAV_LINKS = getMenuLinks(false);
export const MOBILE_NAV_LINKS = getMenuLinks(true);

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
