import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant: 'primary' | 'secondary' | 'outline' | 'alt';
	isActive?: boolean;
	isRounded?: boolean;
};

const Button = styled.button<ButtonProps>`
	font-family: ${(props) => props.theme.fonts.bold};
	height: 32px;
	font-size: 12px;
	padding: 0 12px;
	border-radius: ${(props) => (props.isRounded ? '100px' : '4px')};
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
		props.size === 'lg' &&
		css`
			padding: 0 40px;
			height: 40px;
		`}		


	${(props) =>
		props.size === 'xl' &&
		css`
			height: 48px;
		`}				

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

		${(props) =>
			props.variant === 'outline' &&
			css`
				border-radius: 2px;
				color: ${(props) => props.theme.colors.white};
				background-color: ${(props) => props.theme.colors.elderberry};
				border: 1px solid ${(props) => props.theme.colors.navy};
				&:hover {
					&:not(:disabled) {
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.navy};
					}
				}
				${(props) =>
					// @ts-ignore
					props.isActive &&
					css`
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.navy};
					`};
			`}		

		${(props) =>
			props.variant === 'alt' &&
			css`
				border-radius: 2px;
				color: ${(props) => props.theme.colors.white};
				background-color: ${(props) => props.theme.colors.navy};
				border: 1px solid ${(props) => props.theme.colors.navy};
				&:hover {
					&:not(:disabled) {
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.navy};
					}
				}
				${(props) =>
					// @ts-ignore
					props.isActive &&
					css`
						color: ${(props) => props.theme.colors.white};
						background-color: ${(props) => props.theme.colors.navy};
					`};
			`}								

`;

export default Button;
