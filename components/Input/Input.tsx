import styled, { css } from 'styled-components';

export const inputCSS = css`
	width: 100%;
	min-width: 0;
	font-family: ${(props) => props.theme.fonts.regular};
	border: ${(props) => props.theme.colors.current.border};
	background: ${(props) => props.theme.colors.current.input.secondary.background};
	height: 46px;
	padding: 0 12px;
	font-size: 18px;
	border-radius: 16px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	outline: none;

	::placeholder {
		color: ${(props) => props.theme.colors.current.input.placeholder};
	}
`;

export const Input = styled.input`
	${inputCSS};
`;

export default Input;
