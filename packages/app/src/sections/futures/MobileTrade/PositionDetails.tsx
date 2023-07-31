import React from 'react'
import styled from 'styled-components'

import FuturesPositionsTable from 'sections/dashboard/FuturesPositionsTable'
import { SectionHeader, SectionSeparator, SectionTitle } from 'sections/futures/mobile'
import { selectFuturesType } from 'state/futures/common/selectors'
import { selectPosition } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

const PositionDetails = () => {
	const position = useAppSelector(selectPosition)
	const accountType = useAppSelector(selectFuturesType)

	return position ? (
		<>
			<PositionDetailsContainer>
				<SectionHeader>
					<SectionTitle>Open Position</SectionTitle>
				</SectionHeader>
				<FuturesPositionsTable
					accountType={accountType}
					showCurrentMarket={false}
					showEmptyTable={false}
				/>
			</PositionDetailsContainer>
		</>
	) : (
		<>
			<SectionSeparator />
			<FuturesPositionsTable
				accountType={accountType}
				showCurrentMarket={false}
				showEmptyTable={false}
			/>
		</>
	)
}

const PositionDetailsContainer = styled.div`
	margin: 15px;
`

export default PositionDetails
