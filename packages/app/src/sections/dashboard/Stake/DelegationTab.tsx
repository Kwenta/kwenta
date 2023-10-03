import styled from 'styled-components'

import media from 'styles/media'

import DelegationInput from './DelegationInput'
import DelegationTable from './DelegationTable'

const DelegationTab = () => {
	return (
		<GridContainer>
			<DelegationInput />
			<DelegationTable />
		</GridContainer>
	)
}

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 15px;

	${media.lessThan('lg')`
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 25px;
		margin-bottom: 25px;
	`}
`

export default DelegationTab
