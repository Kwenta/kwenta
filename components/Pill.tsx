import { FC, memo } from 'react';
import styled, { css } from 'styled-components';

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	size?: 'small' | 'large';
	color?: 'yellow' | 'gray' | 'red';
	outline?: boolean;
};

const Pill: FC<PillProps> = memo(({ size = 'small', color = 'yellow', outline, ...props }) => {
	return <BasePill $size={size} $color={color} $outline={outline} {...props} />;
});

const BasePill = styled.button<{
	$size: 'small' | 'large';
	$color: 'yellow' | 'gray' | 'red';
	$outline?: boolean;
}>`
	${(props) => css`
		padding: ${props.$size === 'small' ? '5px' : '8px'};
		font-size: ${props.$size === 'small' ? 10 : 12}px;
		font-family: ${props.theme.fonts.black};
		background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].background};
		color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].text};
		border: 1px solid ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].border};
		border-radius: 50px;

		${props.$outline &&
		css`
			background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].outline
				.background};
			color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].outline.text};
			border: 1px solid
				${props.theme.colors.selectedTheme.newTheme.pill[props.$color].outline.border};
		`}

		&:hover {
			background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].hover.background};
			color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].hover.text};
			border: 1px solid ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].hover.border};
		}
	`}
`;

export default Pill;
