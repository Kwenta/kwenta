import { FC } from 'react';
import styled, { css } from 'styled-components';

// TODO: Clean up these styles
export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'flat'
	| 'alt'
	| 'success'
	| 'danger'
	| 'text'
	| 'select'
	| 'yellow';

type ButtonProps = {
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	variant?: ButtonVariant;
	isActive?: boolean;
	isRounded?: boolean;
	mono?: boolean;
	fullWidth?: boolean;
	noOutline?: boolean;
	textColor?: 'yellow';
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
};

export const border = css`
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border: none;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 8px;
		padding: 1px;
		background: ${(props) => props.theme.colors.selectedTheme.button.border};
		-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-image: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
		mask-composite: exclude;
	}
`;

const Button = styled.button<ButtonProps>`
	height: auto;
	cursor: pointer;
	position: relative;
	border-radius: ${(props) => (props.isRounded ? '50px' : '8px')};
	padding: 0 14px;
	box-sizing: border-box;
	text-transform: ${(props) => props.textTransform || 'capitalize'};
	outline: none;
	white-space: nowrap;
	font-size: 17px;
	color: ${(props) =>
		(props.textColor && props.theme.colors.selectedTheme.button.text[props.textColor]) ||
		props.theme.colors.selectedTheme.button.text.primary};
	transition: all 0.1s ease-in-out;
	${border}
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
	}

	${(props) =>
		props.variant === 'primary' &&
		css`
			background: ${props.theme.colors.selectedTheme.button.primary.background};
			text-shadow: ${props.theme.colors.selectedTheme.button.primary.textShadow};
			&:hover {
				background: ${props.theme.colors.selectedTheme.button.primary.hover};
			}
		`};

	${(props) =>
		(props.noOutline || props.variant === 'flat') &&
		css`
			background: ${(props) => props.theme.colors.selectedTheme.button.fill};
			border: ${(props) => props.theme.colors.selectedTheme.border};
			box-shadow: none;
			&:hover {
				background: ${(props) => props.theme.colors.selectedTheme.button.fillHover};
			}
			&::before {
				display: none;
			}
		`};

	${(props) =>
		props.variant === 'yellow' &&
		css`
			background: ${(props) => props.theme.colors.selectedTheme.button.yellow.fill};
			border: 1px solid ${(props) => props.theme.colors.selectedTheme.button.yellow.border};
			color: ${(props) => props.theme.colors.selectedTheme.button.yellow.text};

			box-shadow: none;
			&:hover {
				background: ${(props) => props.theme.colors.selectedTheme.button.yellow.fillHover};
			}
			&::before {
				display: none;
			}
		`};

	${(props) =>
		props.mono
			? css`
					font-family: ${props.theme.fonts.mono};
			  `
			: css`
					font-family: ${props.theme.fonts.bold};
			  `};

	${(props) =>
		props.variant === 'secondary' &&
		css`
			color: ${props.theme.colors.selectedTheme.button.secondary.text};
		`};

	${(props) =>
		props.variant === 'danger' &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`};

	${(props) =>
		props.size === 'xs' &&
		css`
			height: 22px;
			min-width: 50px;
			font-size: 11px;
		`};

	${(props) =>
		props.size === 'sm' &&
		css`
			height: 41px;
			min-width: 157px;
			font-size: 15px;
		`};

	${(props) =>
		props.size === 'md' &&
		css`
			height: 50px;
			min-width: 200px;
		`};

	${(props) =>
		props.size === 'lg' &&
		css`
			height: 70px;
			min-width: 260px;
			font-size: 19px;
		`};

	${(props) =>
		props.size === 'xl' &&
		css`
			height: 80px;
			min-width: 360px;
			font-size: 21px;
		`};

	${(props) =>
		props.fullWidth &&
		css`
			width: 100%;
		`};

	&:disabled {
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		background: transparent;
		box-shadow: none;
		text-shadow: none;
		border: ${(props) => props.theme.colors.selectedTheme.border};
		cursor: not-allowed;
		&::before {
			display: none;
		}
	}
`;

type NewButtonProps = {};

const NewButton: FC<NewButtonProps> = ({ children }) => {
	return <Button>{children}</Button>;
};

export default Button;
