import styled, { css } from 'styled-components';

type Contrast = 'strong' | 'mild';

const sharedStyles = css<{ fontWeight?: string; contrast?: Contrast }>`
	font-family: ${(props) => props.theme.fonts.mono};
	font-weight: ${(props) => props.fontWeight || 'regular'};
	color: ${({ contrast, theme }) => {
		if (!contrast) return theme.colors.selectedTheme.gray;
		return contrast === 'strong'
			? theme.colors.selectedTheme.text.value
			: theme.colors.selectedTheme.text.label;
	}};
`;

export const NumberDiv = styled.div<{ fontWeight?: string; contrast?: Contrast }>`
	${sharedStyles}
`;

export const NumberSpan = styled.span<{ fontWeight?: string; contrast?: Contrast }>`
	${sharedStyles}
`;
