import { Synths } from 'constants/currency';
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
		link: ROUTES.Exchange.Home,
	},
	{
		i18nLabel: 'header.nav.shorting',
		link: ROUTES.Shorting.Home,
	},
	{
		i18nLabel: 'header.nav.futures-dashboard',
		link: ROUTES.FuturesDashboard.Home,
	},
	{
		i18nLabel: 'header.nav.futures',
		link: ROUTES.Futures.Market.MarketPair(Synths.sBTC),
	},
	{
		i18nLabel: 'header.nav.leaderboard',
		link: ROUTES.Leaderboard.Home,
	},
];

export const MENU_LINKS_WALLET_CONNECTED: MenuLinks = [];
