import styled from 'styled-components'

import { Body } from 'components/Text'

export const Title = styled(Body).attrs({ weight: 'bold' })`
	font-size: 16px;
	text-align: left;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
`

export const Copy = styled(Body)`
	font-size: 16px;
	font-style: normal;
	line-height: 24px;
	text-align: left;
	color: ${(props) => props.theme.colors.silver};
`
