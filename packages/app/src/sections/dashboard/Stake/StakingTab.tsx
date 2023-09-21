import { formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { SplitContainer } from 'components/layout/grid'
import { Body, Heading } from 'components/Text'
import { STAKING_DISABLED } from 'constants/ui'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimStakingRewards } from 'state/staking/actions'
import {
	selectApy,
	selectClaimableBalance,
	selectIsGettingReward,
	selectStakedKwentaBalance,
} from 'state/staking/selectors'
import media from 'styles/media'

import StakeInputCard from './InputCards/StakeInputCard'
import { StakingCards } from './types'

const StakingTab = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const claimableBalance = useAppSelector(selectClaimableBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const isClaimingReward = useAppSelector(selectIsGettingReward)
	const apy = useAppSelector(selectApy)

	const handleGetReward = useCallback(() => {
		dispatch(claimStakingRewards())
	}, [dispatch])

	const stakingAndRewardsInfo: StakingCards[] = useMemo(
		() => [
			{
				key: 'staking',
				category: t('dashboard.stake.tabs.staking.title'),
				card: [
					{
						key: 'staking-staked',
						title: t('dashboard.stake.portfolio.balance.staked'),
						value: formatNumber(stakedKwentaBalance, { suggestDecimals: true }),
					},
					{
						key: 'staking-apr',
						title: t('dashboard.stake.portfolio.rewards.apr'),
						value: formatPercent(apy, { minDecimals: 2 }),
					},
				],
				flex: 1,
			},
			{
				key: 'rewards',
				category: t('dashboard.stake.portfolio.rewards.title'),
				card: [
					{
						key: 'rewards-claimable',
						title: t('dashboard.stake.portfolio.rewards.claimable'),
						value: formatNumber(claimableBalance, { suggestDecimals: true }),
					},
				],
				flex: 0.5,
			},
		],
		[apy, claimableBalance, stakedKwentaBalance, t]
	)

	return (
		<SplitContainer>
			<StakeInputCard />
			<CardGridContainer>
				<StyledHeading variant="h4">
					{t('dashboard.stake.tabs.staking.staking-rewards.title')}
				</StyledHeading>
				<CardsContainer>
					{stakingAndRewardsInfo
						.filter((info) => !info.hidden)
						.map(({ key, category, card, flex, icon }) => (
							<FlexDivCol rowGap="15px" key={key}>
								<LabelContainer size="large">
									{category} {icon}
								</LabelContainer>
								<FlexDivRow columnGap="25px" justifyContent="flex-start" style={{ flex }}>
									{card.map(({ key, title, value }) => (
										<FlexDivCol rowGap="5px" key={key}>
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
						variant="flat"
						size="small"
						textTransform="uppercase"
						isRounded
						loading={isClaimingReward}
						disabled={claimableBalance.eq(0) || isClaimingReward || STAKING_DISABLED}
						onClick={handleGetReward}
					>
						{t('dashboard.stake.tabs.staking.claim')}
					</Button>
				</FlexDivRow>
			</CardGridContainer>
		</SplitContainer>
	)
}

const LabelContainer = styled(Body)`
	display: flex;
	flex-direction: row;
	column-gap: 5px;
	align-items: center;
`

const CardsContainer = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: flex-start;
	flex-wrap: wrap;
	column-gap: 50px;
	row-gap: 25px;
	margin: 50px 0;
	${media.lessThan('lg')`
		margin: 30px 0;
	`}
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	${media.lessThan('lg')`
		justify-content: flex-start;
	`}
`

export default StakingTab
