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

	color: #ece8e3;
	border: 1px solid #ffffff1a;
	background: linear-gradient(180deg, #39332d 0%, #2d2a28 100%);
	box-shadow: 0px 0px 20px 0px #ffffff08 inset;
	box-shadow: 0px 2px 2px 0px #00000040;

	&:hover {
		background: linear-gradient(180deg, #4f463d 0%, #332f2d 100%);
		box-shadow: 0px 2px 2px 0px #00000040;
	}

	${(props) =>
		props.mono
			? css`
					font-family: ${(props) => props.theme.fonts.mono};
			  `
			: css`
					font-family: ${(props) => props.theme.fonts.bold};
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
				color: #ece8e3;
				text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.4);

				&:before {
					box-shadow: 0px 2px 2px 0px #00000040;
				}
			}
		`};

	${(props) =>
		props.variant === 'success' &&
		css`
			color: #7fd482;
			border: 2px solid #7fd482;

			&:hover {
				background: linear-gradient(
					180deg,
					rgba(127, 212, 130, 0.15) 0%,
					rgba(71, 122, 73, 0.15) 100%
				);

				&:before {
					border: 2px solid rgba(127, 212, 130, 0.2);
				}
			}
		`};

	${(props) =>
		props.variant === 'danger' &&
		css`
			color: #ef6868;
			border: 2px solid #ef6868;

			&:hover {
				background: linear-gradient(
					180deg,
					rgba(239, 104, 104, 0.5) 0%,
					rgba(116, 56, 56, 0.5) 100%
				);

				&:before {
					border: 2px solid rgba(239, 104, 104, 0.2);
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
