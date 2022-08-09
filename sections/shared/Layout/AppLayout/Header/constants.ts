import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';

export type MenuLink = {
	i18nLabel: string;
	link: string;
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'header.nav.dashboard',
		link: ROUTES.Home.Overview,
	},
	{
		i18nLabel: 'header.nav.markets',
		link: ROUTES.Markets.Home,
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
		link: ROUTES.Markets.Home,
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

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
