import styled, { css } from 'styled-components';

export const inputCSS = css`
	width: 100%;
	min-width: 0;
	font-family: ${(props) => props.theme.fonts.regular};
	background-color: ${(props) => props.theme.colors.black};
	height: 32px;
	padding: 0 8px;
	font-size: 14px;
	border: 0;
	border-radius: 4px;
	color: ${(props) => props.theme.colors.white};
	::placeholder {
		color: ${(props) => props.theme.colors.silver};
	}
	outline: none;
`;

export const Input = styled.input`
	${inputCSS};
`;

export default Input;
