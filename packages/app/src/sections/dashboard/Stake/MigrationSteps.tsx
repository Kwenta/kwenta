import { formatNumber } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useMemo, useCallback, FC, memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { STAKING_DISABLED } from 'constants/ui'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimStakingRewards, claimStakingRewardsV2, unstakeKwenta } from 'state/staking/actions'
import {
	selectClaimableBalance,
	selectIsGettingReward,
	selectIsUnstakingKwenta,
	selectStakedKwentaBalance,
	selectStakingV2Claimed,
} from 'state/staking/selectors'
import media from 'styles/media'

const MigrationSteps: FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const claimableBalance = useAppSelector(selectClaimableBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta)
	const isClaimingReward = useAppSelector(selectIsGettingReward)
	const stakingV2Claimed = useAppSelector(selectStakingV2Claimed)

	const handleGetReward = useCallback(() => {
		dispatch(claimStakingRewards())
	}, [dispatch])

	const handleUnstakeKwenta = useCallback(
		() => dispatch(unstakeKwenta(wei(stakedKwentaBalance).toBN())),
		[dispatch, stakedKwentaBalance]
	)

	const handleGetRewardV2 = useCallback(() => {
		dispatch(claimStakingRewardsV2())
	}, [dispatch])

	const migrationSteps = useMemo(
		() => [
			{
				key: 'step-1',
				copy: t('dashboard.stake.tabs.migrate.step-1-copy'),
				label: t('dashboard.stake.tabs.migrate.rewards'),
				value: formatNumber(claimableBalance, { suggestDecimals: true }),
				buttonLabel: t('dashboard.stake.tabs.migrate.claim'),
				onClick: handleGetReward,
				active: claimableBalance.gt(0) && !STAKING_DISABLED,
				loading: isClaimingReward && claimableBalance.gt(0),
			},
			{
				key: 'step-2',
				copy: t('dashboard.stake.tabs.migrate.step-2-copy'),
				label: t('dashboard.stake.tabs.migrate.registration'),
				value: stakingV2Claimed
					? t('dashboard.stake.tabs.migrate.registered')
					: t('dashboard.stake.tabs.migrate.unregistered'),
				buttonLabel: t('dashboard.stake.tabs.migrate.register'),
				onClick: handleGetRewardV2,
				active: claimableBalance.eq(0) && !stakingV2Claimed && !STAKING_DISABLED,
				loading: isClaimingReward && claimableBalance.eq(0),
			},
			{
				key: 'step-3',
				copy: t('dashboard.stake.tabs.migrate.step-3-copy'),
				label: t('dashboard.stake.tabs.migrate.staked'),
				value: formatNumber(stakedKwentaBalance, { suggestDecimals: true }),
				buttonLabel: t('dashboard.stake.tabs.migrate.unstake'),
				onClick: handleUnstakeKwenta,
				active:
					claimableBalance.eq(0) &&
					stakingV2Claimed &&
					stakedKwentaBalance.gt(0) &&
					!STAKING_DISABLED,
				loading: isUnstakingKwenta,
			},
		],
		[
			claimableBalance,
			handleGetReward,
			handleGetRewardV2,
			handleUnstakeKwenta,
			isClaimingReward,
			isUnstakingKwenta,
			stakedKwentaBalance,
			stakingV2Claimed,
			t,
		]
	)

	return (
		<StepsContainer columnGap="15px">
			{migrationSteps.map(
				({ key, copy, label, value, buttonLabel, active, onClick, loading }, i) => (
					<StyledStakingCard key={key} $active={active}>
						<StyledHeading variant="h4">
							<Trans
								i18nKey="dashboard.stake.tabs.migrate.step"
								values={{ index: i + 1 }}
								components={[<span />]}
							/>
						</StyledHeading>
						<Body size="small" color="secondary">
							{copy}
						</Body>
						<Spacer height={25} />
						<FlexDivRowCentered>
							<FlexDivCol rowGap="5px">
								<Body size="small" color="secondary">
									{label}
								</Body>
								<Body size="large" color="preview">
									{value}
								</Body>
							</FlexDivCol>
							<Button
								variant="yellow"
								size="small"
								textTransform="uppercase"
								isRounded
								disabled={!active || loading}
								loading={loading}
								onClick={onClick}
							>
								{buttonLabel}
							</Button>
						</FlexDivRowCentered>
					</StyledStakingCard>
				)
			)}
		</StepsContainer>
	)
})

const StepsContainer = styled(FlexDivRowCentered)`
	margin: 30px 0 15px;
	${media.lessThan('lg')`
		flex-direction: column;
		row-gap: 25px;
		margin: 0;
		margin-bottom: 25px;
	`}
`

const StyledStakingCard = styled(StakingCard)<{ $active: boolean }>`
	width: 100%;
	column-gap: 10px;
	opacity: ${(props) => (props.$active ? '1' : '0.3')};
	padding: 25px;
	height: 150px;
	border: 1px solid
		${(props) => props.theme.colors.selectedTheme.newTheme.pill.yellow.outline.border};
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

export default MigrationSteps
