import styled, { css } from 'styled-components';
import ROUTES from 'constants/routes';

export const MenuButton = styled.div<{ isActive: boolean }>`
	outline: none;
	width: 100%;
	font-size: 25px;
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin-bottom: 30px;
	display: flex;
	align-items: center;

	${(props) =>
		props.isActive &&
		css`
			color: ${(props) => props.theme.colors.common.primaryWhite};
		`}

	svg {
		margin-left: 15px;
	}
`;

export const SUB_MENUS = {
	[ROUTES.Home.Overview]: [
		{ label: 'Overview', link: '/' },
		{ label: 'Positions', link: '/positions' },
		{ label: 'Rewards', link: '/rewards' },
		{ label: 'Markets', link: '/markets' },
		{ label: 'Governance', link: '/governance' },
	],
};
