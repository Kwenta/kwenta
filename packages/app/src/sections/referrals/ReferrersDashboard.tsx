import { FC, memo } from 'react'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body } from 'components/Text'
import { StakingCard } from 'sections/dashboard/Stake/card'
import media from 'styles/media'

import { ReferralsMetrics } from './types'

type ReferrersDashboardProps = {
	data: ReferralsMetrics[]
}

const ReferrersDashboard: FC<ReferrersDashboardProps> = memo(({ data }) => {
	return (
		<Container columnGap="15px">
			{data.map(({ key, label, value, buttonLabel, icon, onClick }) => (
				<StyledCard key={key}>
					<FlexDivRowCentered columnGap="25px">
						{icon}
						<FlexDivCol>
							<Body size="large">{label}</Body>
							<Spacer height={15} />
							<Body size="large" color="preview">
								{value}
							</Body>
						</FlexDivCol>
					</FlexDivRowCentered>
					{buttonLabel && (
						<Button size="xsmall" textTransform="uppercase" onClick={onClick}>
							{buttonLabel}
						</Button>
					)}
				</StyledCard>
			))}
		</Container>
	)
})

const Container = styled(FlexDivRowCentered)`
	margin: 0;
	${media.lessThan('lg')`
		flex-direction: column;
		row-gap: 25px;
		margin: 0;
		margin-bottom: 25px;
	`}
`

const StyledCard = styled(StakingCard)`
	width: 100%;
	column-gap: 15px;
	padding: 25px;
	display: flex;
	height: 100px;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
`

export default ReferrersDashboard
