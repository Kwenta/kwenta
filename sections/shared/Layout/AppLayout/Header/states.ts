import { selector } from 'recoil';

import { MENU_LINKS, MenuLink, HOMEPAGE_MENU_LINKS } from './constants';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: () => {
		return MENU_LINKS.filter((menuLink) => menuLink.link);
	},
});

export const homepageMenuLinksState = selector<MenuLink[]>({
	key: 'homepageMenuLinksState',
	get: () => {
		return HOMEPAGE_MENU_LINKS.filter((menuLink) => menuLink.link);
	},
});
