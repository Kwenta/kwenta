import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant: 'primary' | 'secondary' | 'outline' | 'alt' | 'success' | 'danger' | 'text' | 'select';
	isActive?: boolean;
	isRounded?: boolean;
	mono?: boolean;
	fullWidth?: boolean;
};

const Button = styled.button<ButtonProps>`
	height: 41px;
	cursor: pointer;
	position: relative;
	border-radius: 16px;
	padding: 0 14px;
	box-sizing: border-box;
	text-transform: capitalize;
	outine: none;
	white-space: nowrap;

	color: ${(props) => props.theme.colors.common.primaryWhite};
	border: ${(props) => props.theme.colors.defaultTheme.border};
	background: ${(props) => props.theme.colors.defaultTheme.button.background};
	box-shadow: ${(props) => props.theme.colors.defaultTheme.button.shadow};

	&:hover {
		background: ${(props) => props.theme.colors.defaultTheme.button.hover};
	}

	&:disabled {
		color: ${(props) => props.theme.colors.defaultTheme.button.disabled.text};
		border: ${(props) => props.theme.colors.defaultTheme.border};
		background: ${(props) => props.theme.colors.defaultTheme.button.disabled.background};
		box-shadow: none;
		cursor: initial;

		${(props) =>
			props.isActive &&
			css`
				&:hover {
					background: ${props.theme.colors.defaultTheme.button.disabled.background};
					color: ${props.theme.colors.defaultTheme.button.disabled.text};
					text-shadow: none;

					&:before {
						display: none;
					}
				}
			`};
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
		['success', 'danger'].includes(props.variant) &&
		css`
			&:before {
				content: ' ';
				position: absolute;
				z-index: -1;
				top: -4px;
				right: -4px;
				bottom: -4px;
				left: -4px;
				border-radius: 18px;
			}

			&:hover {
				color: ${props.theme.colors.common.primaryWhite};
				text-shadow: ${props.theme.colors.defaultTheme.button.active.textShadow};

				&:before {
					box-shadow: ${props.theme.colors.defaultTheme.button.active.shadow};
				}
			}
		`};

	${(props) =>
		props.variant === 'success' &&
		css`
			color: ${props.theme.colors.common.primaryGreen};
			border: 2px solid ${props.theme.colors.common.primaryGreen};

			&:hover {
				background: ${props.theme.colors.defaultTheme.button.active.hover.successBackground};

				&:before {
					border: 2px solid ${props.theme.colors.defaultTheme.button.active.hover.successBorder};
				}
			}
		`};

	${(props) =>
		props.variant === 'danger' &&
		css`
			color: ${props.theme.colors.common.primaryRed};
			border: 2px solid ${props.theme.colors.common.primaryRed};

			&:hover {
				background: ${props.theme.colors.defaultTheme.button.active.hover.dangerBackground};

				&:before {
					border: 2px solid ${props.theme.colors.defaultTheme.button.active.hover.dangerBorder};
				}
			}
		`};

	${(props) =>
		props.size === 'sm' &&
		css`
			height: 41px;
		`};

	${(props) =>
		props.size === 'md' &&
		css`
			height: 55px;
		`};

	${(props) =>
		props.fullWidth &&
		css`
			width: 100%;
		`};
`;

export default Button;
