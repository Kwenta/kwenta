import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg';
	variant: 'primary' | 'secondary';
	isActive?: boolean;
};

const Button = styled.button<ButtonProps>`
	font-family: ${(props) => props.theme.fonts.bold};
	height: 40px;
	border: none;
	white-space: nowrap;
	cursor: pointer;
	outline: none;
    color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;

    &:disabled {
        background-color: ${(props) => props.theme.colors.stormcloud};
		cursor: default;
	}

	${(props) =>
		props.size === 'sm' &&
		css`
			height: 24px;
		`}

	${(props) =>
		props.size === 'md' &&
		css`
			height: 32px;
		`}

	${(props) =>
		props.variant === 'primary' &&
		css`
			border-radius: 100px;
			padding: 0 40px;
			color: ${(props) => props.theme.colors.white};
			background-color: ${(props) => props.theme.colors.purple};
			&:hover {
				&:not(:disabled) {
					background-color: ${(props) => props.theme.colors.purpleHover};
				}
			}
			${(props) =>
				// @ts-ignore
				props.isActive &&
				css`
					background-color: ${(props) => props.theme.colors.purpleHover};
				`};
		`}

		${(props) =>
			props.variant === 'secondary' &&
			css`
				border-radius: 4px;
				padding: 0 12px;
				color: ${(props) => props.theme.colors.blueberry};
				background-color: ${(props) => props.theme.colors.black};
				&:hover {
					&:not(:disabled) {
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.purple};
					}
				}
				${(props) =>
					// @ts-ignore
					props.isActive &&
					css`
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.purple};
					`};
			`}		

`;

export default Button;
