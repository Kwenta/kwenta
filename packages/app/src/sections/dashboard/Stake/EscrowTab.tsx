import { formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { Body, Heading } from 'components/Text'
import { useAppSelector } from 'state/hooks'
import {
	selectAPY,
	selectAPYV2,
	selectStakedEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalanceV2,
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

	const stakingOverview = useMemo(
		() => [
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
		],
		[
			apy,
			apyV2,
			stakedEscrowedKwentaBalance,
			stakedEscrowedKwentaBalanceV2,
			t,
			totalVestable,
			totalVestableV2,
		]
	)

	return (
		<EscrowTabContainer>
			<GridContainer>
				<EscrowInputCard />
				<CardGridContainer>
					<StyledHeading variant="h4">{t('dashboard.stake.tabs.escrow.title')}</StyledHeading>
					<CardsContainer>
						{stakingOverview.map(({ category, card }, i) => (
							<FlexDivCol rowGap="15px" key={i}>
								<Body size="large">{category}</Body>
								<FlexDivRow columnGap="15px" justifyContent="flex-start">
									{card.map(({ key, title, value }) => (
										<FlexDivCol key={key} rowGap="5px" style={{ flex: '1' }}>
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
				</CardGridContainer>
			</GridContainer>
			<EscrowTable />
		</EscrowTabContainer>
	)
}

const CardsContainer = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: flex-start;
	flex-wrap: wrap;
	column-gap: 50px;
	row-gap: 25px;
	${media.lessThan('lg')`
		flex-direction: column;
		align-items: flex-start;
		row-gap: 25px;
	`}
	${media.lessThan('lg')`
		margin-bottom: 25px;
	`}
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
	${media.lessThan('lg')`
		margin-bottom: 25px;
	`}
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	row-gap: 50px;
	${media.lessThan('lg')`
		row-gap: 25px;
	`}
`

const GridContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	column-gap: 15px;

	${media.lessThan('lg')`
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 25px;
	`}
`

const EscrowTabContainer = styled.div`
	${media.greaterThan('lg')`
		display: flex;
		flex-direction: column;
		row-gap: 15px;
	`}

	${media.lessThan('lg')`
		& > div:first-child {
			margin-bottom: 15px;
		}
	`}
`

export default EscrowTab
