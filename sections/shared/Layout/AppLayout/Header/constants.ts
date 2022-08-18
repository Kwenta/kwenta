import { FunctionComponent } from 'react';

import CrossMarginIcon from 'assets/svg/futures/cross-margin-icon.svg';
import IsolatedMarginIcon from 'assets/svg/futures/isolated-margin-icon.svg';
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';

type SubMenuLink = {
	i18nLabel: string;
	link: string;
	Icon?: FunctionComponent<any>;
};

export type MenuLink = {
	i18nLabel: string;
	link: string;
	links?: SubMenuLink[];
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'header.nav.dashboard',
		link: ROUTES.Home.Overview,
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
	// {
	// 	i18nLabel: 'header.nav.earn',
	// 	link: ROUTES.Earn.Home,
	// },
];

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

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
