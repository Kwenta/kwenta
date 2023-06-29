import { formatPercent, formatTruncatedDuration, truncateNumbers } from '@kwenta/sdk/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import { useAppSelector } from 'state/hooks'
import {
	selectAPY,
	selectAPYV2,
	selectStakedEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakedResetTime,
	selectTotalVestable,
	selectTotalVestableV2,
} from 'state/staking/selectors'
import media from 'styles/media'

import { StakingCard } from './card'
import EscrowTable from './EscrowTable'
import EscrowInputCard from './InputCards/EscrowInputCard'

const EscrowTab = () => {
	const { t } = useTranslation()
	const apy = useAppSelector(selectAPY)
	const apyV2 = useAppSelector(selectAPYV2)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const stakedEscrowedKwentaBalanceV2 = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const totalVestable = useAppSelector(selectTotalVestable)
	const totalVestableV2 = useAppSelector(selectTotalVestableV2)
	const stakedResetTime = useAppSelector(selectStakedResetTime)

	const timeLeft = useMemo(
		() =>
			stakedResetTime > new Date().getTime() / 1000
				? formatTruncatedDuration(stakedResetTime - new Date().getTime() / 1000)
				: NO_VALUE,
		[stakedResetTime]
	)

	const DEFAULT_CARDS = [
		{
			category: 'Overview',
			card: [
				{
					key: 'overview-staked',
					title: t('dashboard.stake.portfolio.escrow.staked'),
					value: truncateNumbers(stakedEscrowedKwentaBalanceV2, 2),
				},
				{
					key: 'overview-apr',
					title: t('dashboard.stake.portfolio.rewards.apr'),
					value: formatPercent(apyV2, { minDecimals: 2 }),
				},
				{
					key: 'overview-vestable',
					title: t('dashboard.stake.portfolio.escrow.vestable'),
					value: truncateNumbers(totalVestableV2, 2),
				},
			],
		},
		{
			category: 'Staking V1',
			card: [
				{
					key: 'staking-v1-staked',
					title: t('dashboard.stake.portfolio.escrow.staked'),
					value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
				},
				{
					key: 'staking-v1-apr',
					title: t('dashboard.stake.portfolio.rewards.apr'),
					value: formatPercent(apy, { minDecimals: 2 }),
				},
				{
					key: 'staking-v1-vestable',
					title: t('dashboard.stake.portfolio.escrow.vestable'),
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
					<LabelContainer rowGap="5px">
						<Body color="secondary">{t('dashboard.stake.portfolio.cooldown.title')}</Body>
						<Body color="primary">{timeLeft}</Body>
					</LabelContainer>
				</CardGridContainer>
			</GridContainer>
			<EscrowTable />
		</EscrowTabContainer>
	)
}

const LabelContainer = styled(FlexDivCol)`
	${media.lessThan('md')`
		margin-top: 25px;
	`}
`

const CardsContainer = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: flex-start;
	column-gap: 50px;

	${media.lessThan('md')`
		flex-direction: column;
		align-items: flex-start;
		row-gap: 25px;
	`}
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
	${media.lessThan('md')`
		margin-bottom: 25px;
	`}
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

	${media.lessThan('md')`
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 25px;
	`}
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
