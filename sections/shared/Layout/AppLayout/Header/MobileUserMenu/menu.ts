import styled, { css } from 'styled-components';

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
