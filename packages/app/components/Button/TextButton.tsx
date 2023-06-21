import styled from 'styled-components'

const TextButton = styled.button`
	text-decoration: underline;
	font-size: 13px;
	line-height: 11px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	background-color: transparent;
	border: none;
	cursor: pointer;
`

export default TextButton
