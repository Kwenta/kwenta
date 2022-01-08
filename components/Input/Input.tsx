import styled, { css } from 'styled-components';

export const inputCSS = css`
	width: 100%;
	min-width: 0;
	font-family: ${(props) => props.theme.fonts.regular};
	border: 1px solid #ffffff1a;
	background: linear-gradient(180deg, #1b1b1b 0%, rgba(27, 27, 27, 0.3) 100%);
	height: 46px;
	padding: 0 12px;
	font-size: 18px;
	border-radius: 16px;
	color: #ece8e3;
	outline: none;

	::placeholder {
		color: #787878;
	}
`;

export const Input = styled.input`
	${inputCSS};
`;

export default Input;
