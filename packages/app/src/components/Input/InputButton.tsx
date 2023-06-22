import styled from 'styled-components'

const InputButton = styled.button`
	height: 22px;
	padding: 3px 2px 4px 10px;
	border: none;
	background: transparent;
	font-size: 16px;
	line-height: 16px;
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	cursor: pointer;
	&:hover {
		svg > path {
			fill: ${(props) => props.theme.colors.selectedTheme.input.hover};
		}
	}
`

export default InputButton
