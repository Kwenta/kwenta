import { formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { SplitContainer } from 'components/layout/grid'
import { Body, Heading } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimStakingRewardsV2, compoundRewards } from 'state/staking/actions'
import {
	selectAPYV2,
	selectClaimableBalanceV2,
	selectStakedKwentaBalanceV2,
} from 'state/staking/selectors'
import media from 'styles/media'

import StakeInputCard from './InputCards/StakeInputCard'

const StakingTab = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const claimableBalance = useAppSelector(selectClaimableBalanceV2)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalanceV2)
	const apy = useAppSelector(selectAPYV2)

	const handleGetReward = useCallback(() => {
		dispatch(claimStakingRewardsV2())
	}, [dispatch])

	const handleCompoundReward = useCallback(() => {
		dispatch(compoundRewards())
	}, [dispatch])

	const DEFAULT_CARDS = [
		{
			category: 'Staking',
			card: [
				{
					key: 'staking-staked',
					title: t('dashboard.stake.portfolio.balance.staked'),
					value: truncateNumbers(stakedKwentaBalance, 2),
				},
				{
					key: 'staking-apr',
					title: t('dashboard.stake.portfolio.rewards.apr'),
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
					value: NO_VALUE,
				},
				{
					key: 'early-vest-rewards-epoch',
					title: t('dashboard.stake.portfolio.early-vest-rewards.epoch'),
					value: NO_VALUE,
				},
			],
		},
	]

	return (
		<SplitContainer>
			<StakeInputCard showWarning={true} />
			<CardGridContainer>
				<StyledHeading variant="h4">Staking Rewards</StyledHeading>
				<Body color="secondary">Stake your escrowed tokens to earn additional rewards.</Body>
				<CardsContainer>
					{DEFAULT_CARDS.map(({ category, card }, i) => (
						<FlexDivCol rowGap="15px" key={i}>
							<Body size="large">{category}</Body>
							<FlexDivRow columnGap="35px" justifyContent="flex-start">
								{card.map(({ key, title, value }) => (
									<FlexDivCol key={key} rowGap="5px">
										<Body color="secondary">{title}</Body>
										<Body size="large" color="preview">
											{value}
										</Body>
									</FlexDivCol>
								))}
							</FlexDivRow>
						</FlexDivCol>
					))}
				</CardsContainer>
				<FlexDivRow justifyContent="flex-start" columnGap="10px">
					<Button
						variant="yellow"
						size="small"
						textTransform="uppercase"
						isRounded
						onClick={handleCompoundReward}
					>
						COMPOUND
					</Button>
					<Button
						variant="flat"
						size="small"
						textTransform="uppercase"
						isRounded
						onClick={handleGetReward}
					>
						{t('dashboard.stake.tabs.staking.claim')}
					</Button>
					<Button
						variant="flat"
						size="small"
						textTransform="uppercase"
						isRounded
						disabled={true}
						onClick={() => {}}
					>
						DELEGATE
					</Button>
				</FlexDivRow>
			</CardGridContainer>
		</SplitContainer>
	)
}

const CardsContainer = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: flex-start;
	flex-wrap: wrap;
	column-gap: 50px;
	row-gap: 25px;
	margin: 50px 0;
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	flex: 1;
	${media.lessThan('lg')`
		width: 100%;
	`}
`

export default StakingTab
