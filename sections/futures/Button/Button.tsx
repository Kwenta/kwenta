import styled, { css } from 'styled-components';

type ButtonProps = {
	onClick(): void;
	size?: 'sm' | 'md';
	variant?: 'success' | 'danger';
};

const Button = styled.button<ButtonProps>`
	${({ size }) =>
		!size || size === 'md'
			? css`
					height: 55px;
			  `
			: css`
					height: 36px;
			  `}

	${({ variant }) =>
		!variant
			? css`
					color: #ece8e3;
					border: 1px solid #ffffff1a;
			  `
			: variant === 'success'
			? css`
					color: #7fd482;
					border: 2px solid #7fd482;
			  `
			: css`
					color: #ef6868;
					border: 2px solid #ef6868;
			  `}

	box-shadow: 0px 0px 20px 0px #ffffff08 inset;
	box-shadow: 0px 2px 2px 0px #00000040;

	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	font-family: ${(props) => props.theme.fonts.bold};

	&:hover {
		background: linear-gradient(180deg, #4f463d 0%, #332f2d 100%);
		box-shadow: 0px 2px 2px 0px #00000040;
	}
`;

export default Button;
