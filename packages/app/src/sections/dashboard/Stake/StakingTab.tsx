import { formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { SplitContainer } from 'components/layout/grid'
import { Body, Heading } from 'components/Text'
import { NO_VALUE } from 'constants/placeholder'
import { StakingCards } from 'pages/dashboard/staking'
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

	const stakingAndRewardsInfo: StakingCards[] = useMemo(
		() => [
			{
				category: t('dashboard.stake.tabs.staking.title'),
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
				flex: 1,
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
				flex: 0.5,
			},
			{
				category: t('dashboard.stake.portfolio.early-vest-rewards.title'),
				icon: <HelpIcon />,
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
				flex: 1,
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
					{stakingAndRewardsInfo.map(({ category, card, flex, icon }, i) => (
						<FlexDivCol rowGap="15px" key={i}>
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
						variant="yellow"
						size="small"
						textTransform="uppercase"
						isRounded
						onClick={handleCompoundReward}
					>
						{t('dashboard.stake.tabs.staking.compound')}
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
