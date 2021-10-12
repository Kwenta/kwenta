import { selector } from 'recoil';

import ROUTES from 'constants/routes';
import { MENU_LINKS, MenuLink } from './constants';
import { isL2MainnetState } from 'store/wallet';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: ({ get }) => {
		const isL2Mainnet = get(isL2MainnetState);
		return isL2Mainnet
			? MENU_LINKS.filter((menuLink: MenuLink) => menuLink.link !== ROUTES.Shorting.Home)
			: MENU_LINKS;
	},
});
