import { formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { useAppSelector } from 'state/hooks'
import { selectAPY, selectClaimableBalance } from 'state/staking/selectors'
import media from 'styles/media'

import { StakingCard } from './card'
import EscrowTable from './EscrowTable'
import EscrowInputCard from './InputCards/EscrowInputCard'

const EscrowTab = () => {
	const { t } = useTranslation()
	const apy = useAppSelector(selectAPY)
	const claimableBalance = useAppSelector(selectClaimableBalance)

	const DEFAULT_CARDS = [
		{
			category: 'Overview',
			card: [
				{
					key: 'staking-staked',
					title: 'Staked',
					value: '150.00',
				},
				{
					key: 'staking-staked',
					title: 'APR',
					value: formatPercent(apy, { minDecimals: 2 }),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.rewards.title'),
			card: [
				{
					key: 'rewards-claimable',
					title: t('dashboard.stake.portfolio.rewards.claimable'),
					value: truncateNumbers(claimableBalance, 2),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.early-vest-rewards.title'),
			card: [
				{
					key: 'early-vest-rewards-claimable',
					title: t('dashboard.stake.portfolio.early-vest-rewards.claimable'),
					value: '150.00',
				},
				{
					key: 'early-vest-rewards-epoch',
					title: t('dashboard.stake.portfolio.early-vest-rewards.epoch'),
					value: 31,
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
					<Body size="small" color="secondary">
						Cooldown
					</Body>
					<Body size="small" color="primary">
						2D:12H:12:12
					</Body>
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
	margin: 50px 0;
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
