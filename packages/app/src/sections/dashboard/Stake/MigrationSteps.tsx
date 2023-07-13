import { formatNumber } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useMemo, useCallback, FC, memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimStakingRewards, unstakeKwenta } from 'state/staking/actions'
import { setStakingMigrationCompleted } from 'state/staking/reducer'
import {
	selectClaimableBalance,
	selectIsGettingReward,
	selectIsUnstakingKwenta,
	selectStakedKwentaBalance,
	selectStakedKwentaBalanceV2,
} from 'state/staking/selectors'
import media from 'styles/media'

const MigrationSteps: FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const claimableBalance = useAppSelector(selectClaimableBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const stakedKwentaBalanceV2 = useAppSelector(selectStakedKwentaBalanceV2)
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta)
	const isClaimingReward = useAppSelector(selectIsGettingReward)

	const handleGetReward = useCallback(() => {
		dispatch(claimStakingRewards())
	}, [dispatch])

	const handleUnstakeKwenta = useCallback(
		() => dispatch(unstakeKwenta(wei(stakedKwentaBalance).toBN())),
		[dispatch, stakedKwentaBalance]
	)

	const handleDismiss = useCallback(() => {
		dispatch(setStakingMigrationCompleted(true))
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
				active: claimableBalance.gt(0),
				loading: isClaimingReward,
			},
			{
				key: 'step-2',
				copy: t('dashboard.stake.tabs.migrate.step-2-copy'),
				label: t('dashboard.stake.tabs.migrate.staked'),
				value: formatNumber(stakedKwentaBalance, { suggestDecimals: true }),
				buttonLabel: t('dashboard.stake.tabs.migrate.unstake'),
				onClick: handleUnstakeKwenta,
				active: claimableBalance.lte(0) && stakedKwentaBalance.gt(0),
				loading: isUnstakingKwenta,
			},
			{
				key: 'step-3',
				copy: t('dashboard.stake.tabs.migrate.step-3-copy'),
				label: t('dashboard.stake.tabs.migrate.staked'),
				value: formatNumber(stakedKwentaBalanceV2, { suggestDecimals: true }),
				buttonLabel: t('dashboard.stake.tabs.migrate.visit-v2'),
				onClick: handleDismiss,
				active: claimableBalance.lte(0) && stakedKwentaBalance.lte(0),
			},
		],
		[
			claimableBalance,
			handleDismiss,
			handleGetReward,
			handleUnstakeKwenta,
			isClaimingReward,
			isUnstakingKwenta,
			stakedKwentaBalance,
			stakedKwentaBalanceV2,
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
	margin: 30px 0;
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
