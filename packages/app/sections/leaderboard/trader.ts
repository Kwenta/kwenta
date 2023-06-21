import styled from 'styled-components'

export const StyledTrader = styled.a`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	display: flex;

	&:hover {
		text-decoration: underline;
		cursor: pointer;
	}
`
