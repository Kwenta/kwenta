import ROUTES from 'constants/routes';
import { selector } from 'recoil';
import { isL2KovanState, isL2MainnetState } from 'store/wallet';
import { MENU_LINKS, MenuLink } from './constants';

export const menuLinksState = selector<MenuLink[]>({
	key: 'menuLinksState',
	get: ({ get }) => {
		const isL2Mainnet = get(isL2MainnetState);
		const isL2Kovan = get(isL2KovanState);

		return MENU_LINKS.filter((menuLink: MenuLink) =>
			isL2Mainnet || isL2Kovan
				? menuLink.link
				: menuLink.link !== ROUTES.Markets.Home && menuLink.link !== ROUTES.Leaderboard.Home
		);
	},
});
