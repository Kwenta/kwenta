import styled, { css } from 'styled-components';

import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import type { ThemeName } from 'styles/theme';

export const MenuButton = styled.div<{
	currentTheme: ThemeName;
	isActive: boolean;
}>`
	outline: none;
	width: 100%;
	font-size: 19px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin-bottom: 30px;
	display: flex;
	justify-content: space-between;
	align-items: center;

	${(props) =>
		props.isActive &&
		css`
			color: ${window.location.pathname === ROUTES.Home.Root || props.currentTheme === 'dark'
				? props.theme.colors.common.primaryWhite
				: props.theme.colors.selectedTheme.black};
			path {
				fill: ${window.location.pathname === ROUTES.Home.Root || props.currentTheme === 'dark'
					? props.theme.colors.common.primaryWhite
					: props.theme.colors.selectedTheme.black};
			}
		`}
`;

export const SUB_MENUS = {
	[ROUTES.Dashboard.Overview]: [
		{ label: 'Overview', link: '/dashboard/overview' },
		// { label: 'Positions', link: '/positions' },
		// { label: 'Rewards', link: '/rewards' },
		{ label: 'Markets', link: '/dashboard/markets' },
		// { label: 'Governance', link: '/governance' },
	],
	[ROUTES.Home.Root]: [
		{ label: 'Overview', link: EXTERNAL_LINKS.Docs.Governance },
		{ label: 'KIPs', link: EXTERNAL_LINKS.Governance.Kips },
	],
};

export const languageIcon = {
	en: '🌐',
};
