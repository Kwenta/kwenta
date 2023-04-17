import { FC, memo } from 'react';
import styled, { css } from 'styled-components';

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	size?: 'small' | 'medium' | 'large';
	color?: 'yellow' | 'gray' | 'red';
	outline?: boolean;
};

const Pill: FC<PillProps> = memo(({ size = 'small', color = 'gray', outline, ...props }) => {
	return <BasePill $size={size} $color={color} $outline={outline} {...props} />;
});

const BasePill = styled.button<{
	$size: 'small' | 'medium' | 'large';
	$color: 'yellow' | 'gray' | 'red';
	$outline?: boolean;
}>`
	${(props) => css`
		padding: ${props.$size === 'small' ? '0 5px' : props.$size === 'medium' ? '3.5px 8px' : '8px'};
		height: ${props.$size === 'medium' ? '24px' : '20px'};
		width: ${props.$size === 'medium' ? '52px' : 'auto'};
		font-size: ${props.$size === 'small' ? 10 : 12}px;
		font-family: ${props.theme.fonts.black};
		background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].background};
		color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].text};
		border: 1px solid ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].border};
		border-radius: 50px;
		cursor: pointer;
		font-variant: all-small-caps;

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
		}
	`}
`;

export default Pill;
