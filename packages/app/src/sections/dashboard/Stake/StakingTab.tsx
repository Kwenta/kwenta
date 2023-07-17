import { formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import { SplitContainer } from 'components/layout/grid'
import { Body, Heading } from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'
import { NO_VALUE } from 'constants/placeholder'
import { STAKING_DISABLED } from 'constants/ui'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimStakingRewards } from 'state/staking/actions'
import {
	selectAPY,
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
	const apy = useAppSelector(selectAPY)

	const handleGetReward = useCallback(() => {
		dispatch(claimStakingRewards())
	}, [dispatch])

	const stakingAndRewardsInfo: StakingCards[] = useMemo(
		() => [
			{
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
			{
				category: t('dashboard.stake.portfolio.early-vest-rewards.title'),
				icon: (
					<CustomStyledTooltip
						width="260px"
						height="auto"
						content={t('dashboard.stake.portfolio.early-vest-rewards.early-vest-rewards-tooltip')}
					>
						<WithCursor cursor="help">
							<HelpIcon />
						</WithCursor>
					</CustomStyledTooltip>
				),
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

const CustomStyledTooltip = styled(Tooltip)`
	padding: 10px;
	white-space: normal;
	top: -120px;
	left: -200px;
	${media.lessThan('md')`
		width: 200px;
		left: -120px;
		top: -130px;
	`}
`

const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`

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
