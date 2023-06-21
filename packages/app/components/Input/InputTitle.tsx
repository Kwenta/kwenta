import styled from 'styled-components'

const InputTitle = styled.div<{ margin?: string }>`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	font-size: 13px;
	margin: ${(props) => props.margin || '0'};
`

export const InputTitleSpan = styled.span<{ invalid?: boolean }>`
	font-size: 13px;
	color: ${(props) =>
		props.invalid ? props.theme.colors.selectedTheme.red : props.theme.colors.selectedTheme.gray};
`

export default InputTitle
