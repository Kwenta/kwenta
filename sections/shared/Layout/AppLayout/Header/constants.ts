import ROUTES from 'constants/routes';

export type MenuLink = {
	i18nLabel: string;
	link: string;
};

export type MenuLinks = MenuLink[];

export const MENU_LINKS: MenuLinks = [
	{
		i18nLabel: 'header.nav.dashboard',
		link: ROUTES.Dashboard.Home,
	},
	{
		i18nLabel: 'header.nav.exchange',
		link: ROUTES.Exchange,
	},
];

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
