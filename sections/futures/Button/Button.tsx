import styled, { css } from 'styled-components';

type ButtonProps = {
	size?: 'sm' | 'md';
	variant?: 'success' | 'danger';
	mono?: boolean;
	active?: boolean;
};

const Button = styled.button<ButtonProps>`
	cursor: pointer;
	position: relative;
	width: 100%;

	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	box-shadow: 0px 0px 20px 0px #ffffff08 inset;
	box-shadow: 0px 2px 2px 0px #00000040;

	&:hover {
		background: linear-gradient(180deg, #4f463d 0%, #332f2d 100%);
		box-shadow: 0px 2px 2px 0px #00000040;
	}

	${({ mono }) =>
		mono
			? css`
					font-family: ${(props) => props.theme.fonts.mono};
			  `
			: css`
					font-family: ${(props) => props.theme.fonts.bold};
			  `}

				${(props) =>
					props.active &&
					css`
						text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);

						&:before {
							content: '';
							position: absolute;
							z-index: -1;
							top: -4px;
							right: -4px;
							bottom: -4px;
							left: -4px;
							border-radius: 18px;
						}
					`}

	${(props) =>
		props.active && props.variant === 'success'
			? css`
					background: linear-gradient(
						180deg,
						rgba(127, 212, 130, 0.5) 0%,
						rgba(71, 122, 73, 0.5) 100%
					);

					&:before {
						border: 2px solid red;
					}
			  `
			: props.variant === 'danger' &&
			  css`
					background: linear-gradient(
						180deg,
						rgba(239, 104, 104, 0.5) 0%,
						rgba(116, 56, 56, 0.5) 100%
					);

					&:before {
						border: 2px solid red;
					}
			  `};

	${({ size }) =>
		!size || size === 'md'
			? css`
					height: 55px;
					border-radius: 16px;
					font-size: 16px;
			  `
			: css`
					height: 36px;
					border-radius: 12px;
					font-size: 15px;
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
`;

export default Button;
