import { selector } from 'recoil';

import ROUTES from 'constants/routes';
import { MENU_LINKS, MenuLink } from './constants';
import { isL2KovanState } from 'store/wallet';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: ({ get }) => {
		const isL2Kovan = get(isL2KovanState);
		return !isL2Kovan
			? MENU_LINKS
			: MENU_LINKS.filter((menuLink: MenuLink) => menuLink.link !== ROUTES.Shorting.Home);
	},
});
