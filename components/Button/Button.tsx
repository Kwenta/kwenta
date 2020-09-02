import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'xs' | 'sm' | 'md' | 'lg';
	variant: 'primary' | 'secondary';
	isActive?: boolean;
};

const Button = styled.button<ButtonProps>`
	font-family: ${(props) => props.theme.fonts.regular};
	border-radius: 100px;
	height: 40px;
	border: none;
	white-space: nowrap;
	cursor: pointer;
	outline: none;
	padding: 0 40px;
    color: ${(props) => props.theme.colors.white};
	text-transform: capitalize;

    &:disabled {
        background-color: ${(props) => props.theme.colors.stormcloud};
		cursor: default;
	}

	${(props) => props.size === 'xs' && css``}

	${(props) => props.size === 'sm' && css``}

	${(props) => props.size === 'md' && css``}

	${(props) =>
		props.variant === 'primary' &&
		css`
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
