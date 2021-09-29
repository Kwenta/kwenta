import { selector } from 'recoil';
import ROUTES from 'constants/routes';
import { MENU_LINKS, MenuLink } from './constants';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: () => {
		return MENU_LINKS.filter(
			(menuLink: MenuLink) =>
				menuLink.link !== ROUTES.Shorting.Home &&
				menuLink.link !== ROUTES.Dashboard.Home &&
				menuLink.link !== ROUTES.Exchange.Home
		);
	},
});
