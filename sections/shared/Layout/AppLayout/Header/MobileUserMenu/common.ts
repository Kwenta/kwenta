import styled, { css } from 'styled-components';

import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';

export const MenuButton = styled.div<{ isActive: boolean }>`
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
			color: ${(props) => props.theme.colors.common.primaryWhite};
			path {
				fill: ${(props) => props.theme.colors.common.primaryWhite};
			}
		`}
`;

export const SUB_MENUS = {
	[ROUTES.Home.Overview]: [
		{ label: 'Overview', link: '/dashboard/overview' },
		// { label: 'Positions', link: '/positions' },
		// { label: 'Rewards', link: '/rewards' },
		{ label: 'Markets', link: '/dashboard/markets' },
		// { label: 'Governance', link: '/governance' },
	],
	[ROUTES.Home.Root]: [
		{ label: 'Overview', link: EXTERNAL_LINKS.Docs.Governance },
		{ label: 'KIPs', link: EXTERNAL_LINKS.Kips.Home },
	],
};

export const lanugageIcons = {
	en: '🌐',
};
