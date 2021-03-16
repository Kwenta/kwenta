import styled, { css } from 'styled-components';
import { resetButtonCSS } from 'styles/common';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant: 'primary' | 'secondary' | 'outline' | 'alt' | 'danger' | 'text' | 'select';
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
        background: ${(props) => props.theme.colors.stormcloud};
		cursor: default;
	}

	${(props) =>
		props.size === 'sm' &&
		css`
			height: 24px;
			line-height: 24px;
		`}

	${(props) =>
		props.size === 'md' &&
		css`
			height: 32px;
			line-height: 32px;
		`}

	${(props) =>
		props.size === 'lg' &&
		css`
			padding: 0 40px;
			height: 40px;
			line-height: 40px;
		`}		


	${(props) =>
		props.size === 'xl' &&
		css`
			height: 48px;
			line-height: 48px;
		`}				

	${(props) =>
		props.variant === 'primary' &&
		css`
			color: ${(props) => props.theme.colors.white};
			background: ${(props) => props.theme.colors.gold};
			&:hover {
				&:not(:disabled) {
					background: ${(props) => props.theme.colors.goldHover};
				}
			}
			${(props) =>
				// @ts-ignore
				props.isActive &&
				css`
					background: ${(props) => props.theme.colors.goldHover};
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
						background: ${(props) => props.theme.colors.gold};
					}
				}
				${(props) =>
					// @ts-ignore
					props.isActive &&
					css`
						color: ${(props) => props.theme.colors.white};
						background: ${(props) => props.theme.colors.gold};
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

${(props) =>
	props.variant === 'select' &&
	css`
		border: 0;
		border-radius: 0;
		color: ${(props) => props.theme.colors.blueberry};
		background-color: ${(props) => props.theme.colors.elderberry};
		&:hover {
			&:not(:disabled) {
				color: ${(props) => props.theme.colors.white};
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
		props.variant === 'danger' &&
		css`
			color: ${(props) => props.theme.colors.white};
			background-color: ${(props) => props.theme.colors.red};
			&:hover {
				&:not(:disabled) {
					background-color: ${(props) => props.theme.colors.redHover};
				}
			}
			${(props) =>
				// @ts-ignore
				props.isActive &&
				css`
					background-color: ${(props) => props.theme.colors.redHover};
				`};
		`}									

		${(props) =>
			props.variant === 'text' &&
			css`
				${resetButtonCSS};
				color: ${(props) => props.theme.colors.white};
				&:hover {
					&:not(:disabled) {
						color: ${(props) => props.theme.colors.silver};
					}
				}
				${(props) =>
					// @ts-ignore
					props.isActive &&
					css`
						color: ${(props) => props.theme.colors.white};
					`};
			`}	
`;

export default Button;
