import { formatNumber, formatTruncatedDuration } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { useRouter } from 'next/router'
import { useMemo, memo, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import ROUTES from 'constants/routes'
import useDebouncedMemo from 'hooks/useDebouncedMemo'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	claimMultipleAllRewards,
	claimStakingRewards,
	unstakeKwenta,
	vestEscrowedRewards,
} from 'state/staking/actions'
import {
	selectClaimableBalanceV1,
	selectIsClaimingAllRewards,
	selectIsGettingReward,
	selectIsUnstakingKwenta,
	selectIsVestingEscrowedRewards,
	selectKwentaRewards,
	selectStakedKwentaBalanceV1,
	selectStepApproveActive,
	selectStepClaimActive,
	selectStepClaimFlowActive,
	selectStepClaimTradingActive,
	selectStepMigrateActive,
	selectStepMigrateFlowActive,
	selectStepRegisterActive,
	selectStepUnstakeActive,
	selectStepVestActive,
} from 'state/staking/selectors'
import {
	approveEscrowMigrator,
	migrateEntries,
	registerEntries,
} from 'state/stakingMigration/actions'
import {
	selectInMigrationPeriod,
	selectIsApprovingEscrowMigrator,
	selectIsMigratingEntries,
	selectIsMigrationPeriodStarted,
	selectIsRegisteringEntries,
	selectMigrationSecondsLeft,
	selectNumberOfUnmigratedRegisteredEntries,
	selectNumberOfUnregisteredEntries,
	selectNumberOfUnvestedRegisteredEntries,
	selectUnmigratedRegisteredEntryIDs,
	selectUnregisteredVestingEntryIDs,
	selectUnvestedRegisteredEntryIDs,
} from 'state/stakingMigration/selectors'
import media from 'styles/media'

import { StakingHeading } from './StakingHeading'

const REGISTER_BATCH_SIZE = 500
const VEST_BATCH_SIZE = 2000
const MIGRATE_BATCH_SIZE = 175

const MigrationSteps = memo(() => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const claimableBalance = useAppSelector(selectClaimableBalanceV1)
	const kwentaTradingRewards = useAppSelector(selectKwentaRewards)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalanceV1)
	const unregisteredVestingEntryIDs = useAppSelector(selectUnregisteredVestingEntryIDs)
	const unvestedRegisteredEntryIDs = useAppSelector(selectUnvestedRegisteredEntryIDs)
	const unmigratedRegisteredEntryIDs = useAppSelector(selectUnmigratedRegisteredEntryIDs)
	const numberOfUnregisteredVestingEntries = useAppSelector(selectNumberOfUnregisteredEntries)
	const numberOfUnvestedRegisteredVestingEntries = useAppSelector(
		selectNumberOfUnvestedRegisteredEntries
	)
	const numberOfUnmigratedRegisteredVestingEntries = useAppSelector(
		selectNumberOfUnmigratedRegisteredEntries
	)

	const isMigrationPeriodStarted = useAppSelector(selectIsMigrationPeriodStarted)
	const migrationSecondsLeft = useAppSelector(selectMigrationSecondsLeft)
	const migrationTimeCountdown = useMemo(
		() => formatTruncatedDuration(migrationSecondsLeft),
		[migrationSecondsLeft]
	)
	const inMigrationPeriod = useAppSelector(selectInMigrationPeriod)

	const stepClaimFlowActive = useAppSelector(selectStepClaimFlowActive)
	const stepClaimActive = useAppSelector(selectStepClaimActive)
	const stepClaimTradingActive = useAppSelector(selectStepClaimTradingActive)
	const stepMigrateFlowActive = useAppSelector(selectStepMigrateFlowActive)
	const stepUnstakeActive = useAppSelector(selectStepUnstakeActive)
	const stepRegisterActive = useAppSelector(selectStepRegisterActive)
	const stepVestActive = useAppSelector(selectStepVestActive)
	const stepApproveActive = useAppSelector(selectStepApproveActive)
	const stepMigrateActive = useAppSelector(selectStepMigrateActive)

	const isGettingReward = useAppSelector(selectIsGettingReward)
	const isClaimingAllRewards = useAppSelector(selectIsClaimingAllRewards)
	const isRegisteringEntries = useAppSelector(selectIsRegisteringEntries)
	const isVestingEscrowedEntries = useAppSelector(selectIsVestingEscrowedRewards)
	const isApprovingEscrowMigrator = useAppSelector(selectIsApprovingEscrowMigrator)
	const isMigratingEntries = useAppSelector(selectIsMigratingEntries)
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta)

	const handleGetRewards = useCallback(() => {
		dispatch(claimStakingRewards())
	}, [dispatch])

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleAllRewards())
	}, [dispatch])

	const handleRegisterEntryIDs = useCallback(() => {
		dispatch(registerEntries(unregisteredVestingEntryIDs.slice(0, REGISTER_BATCH_SIZE)))
	}, [dispatch, unregisteredVestingEntryIDs])

	const handleVestEntryIDs = useCallback(() => {
		dispatch(vestEscrowedRewards(unvestedRegisteredEntryIDs.slice(0, VEST_BATCH_SIZE)))
	}, [dispatch, unvestedRegisteredEntryIDs])

	const handleApproveEscrowMigrator = useCallback(() => {
		dispatch(approveEscrowMigrator())
	}, [dispatch])

	const handleMigrate = useCallback(() => {
		dispatch(migrateEntries(unmigratedRegisteredEntryIDs.slice(0, MIGRATE_BATCH_SIZE)))
	}, [dispatch, unmigratedRegisteredEntryIDs])

	const handleUnstakeV1 = useCallback(() => {
		dispatch(unstakeKwenta(wei(stakedKwentaBalance).toBN()))
	}, [dispatch, stakedKwentaBalance])

	const handelGoToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.Stake)
	}, [router])

	const migrationSteps = useDebouncedMemo(
		() => [
			{
				key: 'claim',
				title: t('dashboard.stake.tabs.migrate.claim.title'),
				copy: t('dashboard.stake.tabs.migrate.claim.copy'),
				substeps: [
					{
						key: 'claim-v1',
						title: t('dashboard.stake.tabs.migrate.claim.title'),
						copy: t('dashboard.stake.tabs.migrate.claim.copy'),
						label: t('dashboard.stake.tabs.migrate.claim.rewards'),
						value: formatNumber(claimableBalance, { suggestDecimals: true }),
						buttonLabel: t('dashboard.stake.tabs.migrate.claim.button'),
						onClick: handleGetRewards,
						active: stepClaimActive,
						loading: isGettingReward,
					},
					{
						key: 'claim-trading',
						title: t('dashboard.stake.tabs.migrate.claim.trading.title'),
						copy: t('dashboard.stake.tabs.migrate.claim.trading.copy'),
						label: t('dashboard.stake.tabs.migrate.claim.rewards'),
						value: formatNumber(kwentaTradingRewards, { suggestDecimals: true }),
						buttonLabel: t('dashboard.stake.tabs.migrate.claim.trading.button'),
						onClick: handleClaimAll,
						active: stepClaimTradingActive,
						loading: isClaimingAllRewards,
					},
				],
				visible: stepClaimFlowActive,
			},
			{
				key: 'migrate-flow',
				title: t('dashboard.stake.tabs.migrate.migrate.title'),
				copy:
					isMigrationPeriodStarted && inMigrationPeriod ? (
						<Trans
							i18nKey={'dashboard.stake.tabs.migrate.migrate.countdown'}
							components={[<Emphasis />]}
							values={{ time: migrationTimeCountdown }}
						/>
					) : (
						t('dashboard.stake.tabs.migrate.migrate.copy')
					),
				substeps: [
					{
						key: 'register',
						title: t('dashboard.stake.tabs.migrate.migrate.register.title'),
						copy: t('dashboard.stake.tabs.migrate.migrate.register.copy'),
						label: t('dashboard.stake.tabs.migrate.migrate.remaining'),
						value: numberOfUnregisteredVestingEntries,
						buttonLabel: t('dashboard.stake.tabs.migrate.migrate.register.button'),
						onClick: handleRegisterEntryIDs,
						active: stepRegisterActive,
						loading: isRegisteringEntries,
					},
					{
						key: 'vest',
						title: t('dashboard.stake.tabs.migrate.migrate.vest.title'),
						copy: t('dashboard.stake.tabs.migrate.migrate.vest.copy'),
						label: t('dashboard.stake.tabs.migrate.migrate.remaining'),
						value: numberOfUnvestedRegisteredVestingEntries,
						buttonLabel: t('dashboard.stake.tabs.migrate.migrate.vest.button'),
						onClick: handleVestEntryIDs,
						active: stepVestActive,
						loading: isVestingEscrowedEntries,
					},
					{
						key: 'approve',
						title: t('dashboard.stake.tabs.migrate.migrate.approve.title'),
						copy: t('dashboard.stake.tabs.migrate.migrate.approve.copy'),
						buttonLabel: t('dashboard.stake.tabs.migrate.migrate.approve.button'),
						onClick: handleApproveEscrowMigrator,
						active: stepApproveActive,
						loading: isApprovingEscrowMigrator,
					},
					{
						key: 'migrate',
						title: t('dashboard.stake.tabs.migrate.migrate.migrate.title'),
						copy: t('dashboard.stake.tabs.migrate.migrate.migrate.copy'),
						label: t('dashboard.stake.tabs.migrate.migrate.remaining'),
						value: numberOfUnmigratedRegisteredVestingEntries,
						buttonLabel: t('dashboard.stake.tabs.migrate.migrate.migrate.button'),
						onClick: handleMigrate,
						active: stepMigrateActive,
						loading: isMigratingEntries,
					},
				],
				visible: stepMigrateFlowActive,
			},
			{
				key: 'unstake',
				title: t('dashboard.stake.tabs.migrate.unstake.title'),
				copy: isMigrationPeriodStarted
					? inMigrationPeriod
						? t('dashboard.stake.tabs.migrate.unstake.copy')
						: t('dashboard.stake.tabs.migrate.migrate.closed')
					: t('dashboard.stake.tabs.migrate.unstake.copy'),
				substeps: [
					{
						key: 'unstake-v1',
						title: t('dashboard.stake.tabs.migrate.unstake.unstake-v1.title'),
						copy: t('dashboard.stake.tabs.migrate.unstake.unstake-v1.copy'),
						label: t('dashboard.stake.tabs.migrate.unstake.unstake-v1.kwenta-token'),
						value: formatNumber(stakedKwentaBalance, { suggestDecimals: true }),
						buttonLabel: t('dashboard.stake.tabs.migrate.unstake.unstake-v1.button'),
						onClick: handleUnstakeV1,
						active: stepUnstakeActive,
						loading: isUnstakingKwenta,
					},
				],
				visible: stepUnstakeActive,
			},
		],
		[
			claimableBalance,
			handleApproveEscrowMigrator,
			handleClaimAll,
			handleGetRewards,
			handleMigrate,
			handleRegisterEntryIDs,
			handleUnstakeV1,
			handleVestEntryIDs,
			inMigrationPeriod,
			isApprovingEscrowMigrator,
			isClaimingAllRewards,
			isGettingReward,
			isMigratingEntries,
			isMigrationPeriodStarted,
			isRegisteringEntries,
			isUnstakingKwenta,
			isVestingEscrowedEntries,
			kwentaTradingRewards,
			migrationTimeCountdown,
			numberOfUnmigratedRegisteredVestingEntries,
			numberOfUnregisteredVestingEntries,
			numberOfUnvestedRegisteredVestingEntries,
			stakedKwentaBalance,
			stepApproveActive,
			stepClaimActive,
			stepClaimFlowActive,
			stepClaimTradingActive,
			stepMigrateActive,
			stepMigrateFlowActive,
			stepRegisterActive,
			stepUnstakeActive,
			stepVestActive,
			t,
		],
		1500
	)

	const migrationCompeleted = useMemo(
		() => migrationSteps.filter(({ visible }) => visible).length === 0,
		[migrationSteps]
	)

	return (
		<MigrationContainer>
			<StakingHeading
				title={t('dashboard.stake.tabs.migrate.title')}
				copy={t('dashboard.stake.tabs.migrate.copy')}
			/>
			{migrationCompeleted ? (
				<FullWidthStyledStakingCard $active={migrationCompeleted} onClick={handelGoToStaking}>
					<StyledHeading variant="h4">
						{t('dashboard.stake.tabs.migrate.migrate.completed')}
					</StyledHeading>
					<Body color="secondary">
						<Trans
							i18nKey={'dashboard.stake.tabs.migrate.migrate.go-to-staking'}
							components={[<Emphasis />]}
						/>
					</Body>
				</FullWidthStyledStakingCard>
			) : (
				<StepsContainer columnGap="15px">
					{migrationSteps.map(({ key, title, copy, visible, substeps }) => (
						<StyledStakingCard key={key} $active={visible}>
							<StyledHeading variant="h4">{title}</StyledHeading>
							{visible && <Body color="secondary">{copy}</Body>}
							<Spacer height={25} />
							<SubstepsContainer columnGap="15px">
								{visible &&
									substeps.map(
										({ key, title, copy, label, value, buttonLabel, onClick, active, loading }) => (
											<CardsContainer key={key} $active={active}>
												<FlexDivCol rowGap="5px">
													<StyledHeading variant="h4">{title}</StyledHeading>
													<Body color="secondary">{copy}</Body>
												</FlexDivCol>
												<FlexDivRowCentered>
													{label && value && active && (
														<FlexDivCol rowGap="5px">
															<Body color="secondary">{label}</Body>
															<Body size="large" color="preview">
																{value}
															</Body>
														</FlexDivCol>
													)}
													<Button
														variant="yellow"
														size="small"
														textTransform="uppercase"
														isRounded
														disabled={!active}
														loading={loading}
														onClick={onClick}
													>
														{buttonLabel}
													</Button>
												</FlexDivRowCentered>
											</CardsContainer>
										)
									)}
							</SubstepsContainer>
						</StyledStakingCard>
					))}
				</StepsContainer>
			)}
		</MigrationContainer>
	)
})

const Emphasis = styled.b`
	color: ${(props) => props.theme.colors.common.primaryYellow};
`

const SubstepsContainer = styled(FlexDivRowCentered)`
	${media.lessThan('md')`
		flex-direction: column;
		row-gap: 15px;
	`}
`
const CardsContainer = styled(FlexDivCol)<{ $active: boolean }>`
	flex-shrink: 1;
	flex-grow: 5;
	padding: 20px;
	opacity: ${(props) => (props.$active ? '1' : '0.3')};
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	border-radius: 20px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
	justify-content: flex-start;
	column-gap: 50px;
	row-gap: 25px;
	${media.lessThan('mdUp')`
		column-gap: 25px;
		width: 100%;
	`}
`

const StepsContainer = styled(FlexDivRowCentered)`
	margin: 30px 0 15px;
	${media.lessThan('mdUp')`
		flex-direction: column;
		row-gap: 25px;
		margin: 0;
		margin-bottom: 25px;
	`}
`

const StyledStakingCard = styled(StakingCard)<{ $active?: boolean }>`
	min-width: 120px;
	cursor: pointer;
	width: 100%;
	height: 270px;
	column-gap: 10px;
	opacity: ${(props) => (props.$active ? '1' : '0.3')};
	flex: ${(props) => (props.$active ? '10' : '1')};
	padding: 25px;
	border: 1px solid
		${(props) => props.theme.colors.selectedTheme.newTheme.pill.yellow.outline.border};
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const MigrationContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}
	${media.greaterThan('lg')`
		margin-top: 20px;
	`}
`

const FullWidthStyledStakingCard = styled(StyledStakingCard)<{ $active: boolean }>`
	display: ${(props) => (props.$active ? 'flex' : 'none')};
	flex-direction: column;
	justify-content: center;
	align-items: center;
`

export default MigrationSteps
