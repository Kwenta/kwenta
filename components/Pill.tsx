import { FC, memo } from 'react';
import styled, { css } from 'styled-components';

type PillProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	size?: 'small' | 'large';
	color?: 'yellow' | 'gray' | 'red';
	outline?: boolean;
	fullWidth?: boolean;
	isRounded?: boolean;
	blackFont?: boolean;
};

const Pill: FC<PillProps> = memo(
	({
		size = 'small',
		color = 'gray',
		isRounded = true,
		blackFont = true,
		outline,
		fullWidth,
		...props
	}) => {
		return (
			<BasePill
				$size={size}
				$color={color}
				$outline={outline}
				$fullWidth={fullWidth}
				$isRounded={isRounded}
				$blackFont={blackFont}
				{...props}
			/>
		);
	}
);

const BasePill = styled.button<{
	$size: 'small' | 'large';
	$color: 'yellow' | 'gray' | 'red';
	$outline?: boolean;
	$fullWidth?: boolean;
	$isRounded?: boolean;
	$blackFont?: boolean;
}>`
	${(props) => css`
		padding: ${props.$size === 'small' ? '0 5px' : '10px 15px'};
		height: ${props.$size === 'small' ? '20px' : '36px'};
		width: ${props.$fullWidth ? '100%' : 'unset'};
		font-size: ${props.$size === 'small' ? 10 : 13}px;
		font-family: ${props.$blackFont ? props.theme.fonts.black : props.theme.fonts.bold};
		background: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].background};
		color: ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].text};
		border: 1px solid ${props.theme.colors.selectedTheme.newTheme.pill[props.$color].border};
		border-radius: ${props.$isRounded ? '50' : '8'}px;
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
