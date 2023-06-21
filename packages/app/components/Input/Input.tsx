import styled, { css } from 'styled-components'

export const inputCSS = css`
	width: 100%;
	min-width: 0;
	font-family: ${(props) => props.theme.fonts.regular};
	border: ${(props) => props.theme.colors.selectedTheme.input.border};
	background: ${(props) => props.theme.colors.selectedTheme.input.background};
	height: 46px;
	padding: 0 12px;
	font-size: 18px;
	border-radius: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	outline: none;

	::placeholder {
		color: ${(props) => props.theme.colors.selectedTheme.input.placeholder};
	}
`

export const Input = styled.input`
	${inputCSS};
`

export default Input
