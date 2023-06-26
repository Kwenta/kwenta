import { formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import styled from 'styled-components'

import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { useAppSelector } from 'state/hooks'
import {
	selectAPY,
	selectStakedEscrowedKwentaBalance,
	selectTotalVestable,
} from 'state/staking/selectors'
import media from 'styles/media'

import { StakingCard } from './card'
import EscrowTable from './EscrowTable'
import EscrowInputCard from './InputCards/EscrowInputCard'

const EscrowTab = () => {
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const apy = useAppSelector(selectAPY)
	const totalVestable = useAppSelector(selectTotalVestable)

	const DEFAULT_CARDS = [
		{
			category: 'Overview',
			card: [
				{
					key: 'overview-staked',
					title: 'Staked',
					value: '150.00',
				},
				{
					key: 'overview-apr',
					title: 'APR',
					value: '150%',
				},
				{
					key: 'overview-vestable',
					title: 'Vestable',
					value: '100.00',
				},
			],
		},
		{
			category: 'Staking V1',
			card: [
				{
					key: 'staking-v1-staked',
					title: 'Staked',
					value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
				},
				{
					key: 'staking-v1-apr',
					title: 'APR',
					value: formatPercent(apy, { minDecimals: 2 }),
				},
				{
					key: 'staking-v1-vestable',
					title: 'Vestable',
					value: truncateNumbers(totalVestable, 2),
				},
			],
		},
	]

	return (
		<EscrowTabContainer>
			<GridContainer>
				<EscrowInputCard />
				<CardGridContainer>
					<StyledHeading variant="h4">Escrow</StyledHeading>
					<CardsContainer>
						{DEFAULT_CARDS.map(({ category, card }, i) => (
							<FlexDivCol rowGap="15px" key={i}>
								<Body size="large">{category}</Body>
								<FlexDivRow columnGap="15px">
									{card.map(({ key, title, value }) => (
										<FlexDivCol key={key} rowGap="5px">
											<Body size="medium" color="secondary">
												{title}
											</Body>
											<Body size="large" color="preview">
												{value}
											</Body>
										</FlexDivCol>
									))}
								</FlexDivRow>
							</FlexDivCol>
						))}
					</CardsContainer>
					<FlexDivCol rowGap="5px">
						<Body size="small" color="secondary">
							Cooldown
						</Body>
						<Body size="small" color="primary">
							2D:12H:12:12
						</Body>
					</FlexDivCol>
				</CardGridContainer>
			</GridContainer>
			<EscrowTable />
		</EscrowTabContainer>
	)
}

const CardsContainer = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: flex-start;
	column-gap: 50px;
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 15px;
`

const EscrowTabContainer = styled.div`
	${media.greaterThan('mdUp')`
		display: flex;
		flex-direction: column;
		row-gap: 15px;
	`}

	${media.lessThan('mdUp')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`

export default EscrowTab
