import { selector } from 'recoil';
import { MENU_LINKS, MenuLink } from './constants';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: () => {
		return MENU_LINKS;
	},
});
