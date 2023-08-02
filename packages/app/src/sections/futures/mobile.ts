import styled from 'styled-components'

import { Body } from 'components/Text'

export const SectionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 15px;
`

export const SectionTitle = styled(Body).attrs({
	weight: 'bold',
	capitalized: true,
	size: 'large',
})`
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.sectionHeader};
`

export const SectionSubTitle = styled(Body).attrs({ color: 'tertiary' })``

export const SectionSeparator = styled.div`
	height: 1px;
	background-color: #2b2a2a;
	margin: 15px;
`

export const Pane = styled.div<{ noPadding?: boolean }>`
	box-sizing: border-box;
	height: 325px;
`
