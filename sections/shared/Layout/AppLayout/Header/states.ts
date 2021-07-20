import { selector } from 'recoil';
import { isL2State } from 'store/wallet';
import ROUTES from 'constants/routes';
import { MENU_LINKS, MenuLink } from './constants';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: ({ get }) => {
		const isL2 = get(isL2State);
		return !isL2
			? MENU_LINKS
			: MENU_LINKS.filter((menuLink: MenuLink) => menuLink.link !== ROUTES.Shorting.Home);
	},
});
