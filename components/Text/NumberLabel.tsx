import styled, { css } from 'styled-components';

const sharedStyles = css<{ fontWeight?: string; themeColor?: string }>`
	font-family: ${(props) => props.theme.fonts.mono};
	font-weight: ${(props) => props.fontWeight || 'regular'};
	color: ${({ themeColor, theme }) =>
		// @ts-ignore
		(themeColor && theme.colors.selectedTheme[themeColor]) || theme.colors.selectedTheme.gray};
`;

export const NumberDiv = styled.div<{ fontWeight?: string; themeColor?: string }>`
	${sharedStyles}
`;

export const NumberSpan = styled.span<{ fontWeight?: string; themeColor?: string }>`
	${sharedStyles}
`;
