import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	variant?: 'primary' | 'secondary' | 'outline' | 'alt' | 'success' | 'danger' | 'text' | 'select';
	isActive?: boolean;
	isRounded?: boolean;
	mono?: boolean;
	fullWidth?: boolean;
	noOutline?:boolean;
};

const Button = styled.button<ButtonProps>`
	height: 41px;
	cursor: pointer;
	position: relative;
	border-radius: 10px;
	padding: 0 14px;
	box-sizing: border-box;
	text-transform: capitalize;
	outline: none;
	white-space: nowrap;
	font-size: 17px;

	&::before {
			content:"";
			position:absolute;
			top:0;
			left:0;
			right:0;
			bottom:0;
			border-radius:10px; 
			padding:1px; 
			background:rgb(255 255 255 / 10%); 
			-webkit-mask: 
				linear-gradient(#fff 0 0) content-box, 
				linear-gradient(#fff 0 0);
			-webkit-mask-composite: xor;
					mask-composite: exclude; 
	}

	color: ${(props) => props.theme.colors.common.primaryWhite};
	/* border: ${(props) => props.theme.colors.selectedTheme.border}; */
	border: none;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	box-shadow: ${(props) => props.theme.colors.selectedTheme.button.shadow};

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.button.hover};
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
			color: ${props.theme.colors.common.primaryWhite};
			text-shadow: ${props.theme.colors.selectedTheme.button.primary.textShadow};

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
			color: ${props.theme.colors.common.primaryRed};
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
		props.noOutline && 
		css`
			&::before {
			background:none; 
		}`
	};

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
		background: ${(props) => props.theme.colors.selectedTheme.button.disabled.background};
		box-shadow: none;
		cursor: not-allowed;
	}
`;

export default Button;
