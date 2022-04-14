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

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
