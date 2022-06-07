import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant?: 'primary' | 'secondary' | 'outline' | 'alt' | 'success' | 'danger' | 'text' | 'select';
	isActive?: boolean;
	isRounded?: boolean;
	mono?: boolean;
	fullWidth?: boolean;
	noOutline?: boolean;
	textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
};

export const border = css`
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border: none;
	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
	}

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 10px;
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
	border-radius: 10px;
	padding: 0 14px;
	box-sizing: border-box;
	text-transform: ${(props) => props.textTransform || 'capitalize'};
	outline: none;
	white-space: nowrap;
	font-size: 17px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	background: ${(props) => props.theme.colors.selectedTheme.button.fill};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	transition: all 0.1s ease-in-out;

	&:hover {
		background: ${(props) =>
			props.noOutline
				? props.theme.colors.selectedTheme.button.fill
				: props.theme.colors.selectedTheme.button.hover};
	}

	${(props) =>
		props.mono
			? css`
					font-family: ${props.theme.fonts.mono};
			  `
			: css`
					font-family: ${props.theme.fonts.bold};
			  `};

	${(props) =>
		props.variant === 'primary' &&
		css`
			background: ${props.theme.colors.selectedTheme.button.primary.background};
			&:hover {
				background: ${props.theme.colors.selectedTheme.button.primary.hover};
			}
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
		props.size === 'sm' &&
		css`
			height: 41px;
			min-width: 157px;
		`};

	${(props) =>
		props.size === 'md' &&
		css`
			height: 50px;
			min-width: 200px;
		`};

	${(props) =>
		!props.noOutline &&
		css`
			${border}
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

export default Button;
