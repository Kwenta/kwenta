import { truncateNumbers } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import { StakingCard } from 'sections/dashboard/Stake/card'
import EscrowTable from 'sections/dashboard/Stake/EscrowTable'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	approveKwentaToken,
	fetchClaimableRewards,
	fetchEscrowData,
	fetchEscrowV2Data,
	fetchStakingData,
	fetchStakingV2Data,
	claimStakingRewards,
	stakeKwentaV2,
	unstakeKwenta,
} from 'state/staking/actions'
import {
	selectClaimableBalance,
	selectClaimableBalanceV2,
	selectIsKwentaTokenApprovedV2,
	selectKwentaBalance,
	selectKwentaRewards,
	selectStakedEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakedKwentaBalance,
	selectStakedKwentaBalanceV2,
	selectTotalVestable,
	selectTotalVestableV2,
} from 'state/staking/selectors'
import { selectWallet } from 'state/wallet/selectors'
import media from 'styles/media'

import { StakingCards } from './staking'

type MigrateComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const MigratePage: MigrateComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const walletAddress = useAppSelector(selectWallet)
	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const claimableBalance = useAppSelector(selectClaimableBalance)
	const claimableBalanceV2 = useAppSelector(selectClaimableBalanceV2)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const stakedKwentaBalanceV2 = useAppSelector(selectStakedKwentaBalanceV2)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const stakedEscrowedKwentaBalanceV2 = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const totalVestable = useAppSelector(selectTotalVestable)
	const totalVestableV2 = useAppSelector(selectTotalVestableV2)
	const kwentaStakingV2Approved = useAppSelector(selectIsKwentaTokenApprovedV2)
	const kwentaRewards = useAppSelector(selectKwentaRewards)

	const handleGetReward = useCallback(() => {
		dispatch(claimStakingRewards())
	}, [dispatch])

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = router.query.tab as StakeTab
			if (Object.values(StakeTab).includes(tab)) {
				return tab
			}
		}
		return null
	}, [router])

	const handleUnstakeKwenta = useCallback(
		() => dispatch(unstakeKwenta(wei(stakedKwentaBalance).toBN())),
		[dispatch, stakedKwentaBalance]
	)

	const handleStakeKwenta = useCallback(() => {
		if (!kwentaStakingV2Approved) {
			dispatch(approveKwentaToken('kwentaStakingV2'))
		} else {
			dispatch(stakeKwentaV2(wei(kwentaBalance).toBN()))
		}
	}, [dispatch, kwentaBalance, kwentaStakingV2Approved])

	const [, setCurrentTab] = useState(tabQuery ?? StakeTab.Staking)

	useEffect(() => {
		if (!!walletAddress) {
			dispatch(fetchStakingData()).then(() => {
				dispatch(fetchClaimableRewards())
				dispatch(fetchStakingV2Data())
			})
			dispatch(fetchEscrowData())
			dispatch(fetchEscrowV2Data())
		}
	}, [dispatch, walletAddress])

	const MIGRATE_STEPS = useMemo(
		() => [
			{
				key: 'step-1',
				copy: t('dashboard.stake.tabs.migrate.step-1-copy'),
				label: t('dashboard.stake.tabs.migrate.rewards'),
				value: truncateNumbers(claimableBalance, 2),
				buttonLabel: t('dashboard.stake.tabs.migrate.claim'),
				onClick: handleGetReward,
				active: claimableBalance.gt(0),
			},
			{
				key: 'step-2',
				copy: t('dashboard.stake.tabs.migrate.step-2-copy'),
				label: t('dashboard.stake.tabs.migrate.staked'),
				value: truncateNumbers(stakedKwentaBalance, 2),
				buttonLabel: t('dashboard.stake.tabs.migrate.unstake'),
				onClick: handleUnstakeKwenta,
				active: claimableBalance.lte(0) && stakedKwentaBalance.gt(0),
			},
			{
				key: 'step-3',
				copy: t('dashboard.stake.tabs.migrate.step-3-copy'),
				label: t('dashboard.stake.tabs.migrate.staked'),
				value: truncateNumbers(stakedKwentaBalanceV2, 2),
				buttonLabel: kwentaStakingV2Approved
					? t('dashboard.stake.tabs.migrate.stake')
					: t('dashboard.stake.tabs.migrate.approve'),
				onClick: handleStakeKwenta,
				active: claimableBalance.lte(0) && stakedKwentaBalance.lte(0),
			},
		],
		[
			claimableBalance,
			handleGetReward,
			handleStakeKwenta,
			handleUnstakeKwenta,
			kwentaStakingV2Approved,
			stakedKwentaBalance,
			stakedKwentaBalanceV2,
			t,
		]
	)

	const MIGRATE_CARDS: StakingCards[] = useMemo(
		() => [
			{
				category: t('dashboard.stake.portfolio.balance.title'),
				card: [
					{
						key: 'balance-liquid',
						title: t('dashboard.stake.portfolio.balance.liquid'),
						value: truncateNumbers(kwentaBalance, 2),
						onClick: () => setCurrentTab(StakeTab.Staking),
					},
					{
						key: 'balance-staked',
						title: t('dashboard.stake.portfolio.balance.staked'),
						value: truncateNumbers(stakedKwentaBalanceV2, 2),
						onClick: () => setCurrentTab(StakeTab.Escrow),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.rewards.title'),
				card: [
					{
						key: 'rewards-claimable',
						title: t('dashboard.stake.portfolio.rewards.staking'),
						value: truncateNumbers(claimableBalanceV2, 2),
						onClick: () => setCurrentTab(StakeTab.Staking),
					},
					{
						key: 'rewards-trading',
						title: t('dashboard.stake.portfolio.rewards.trading'),
						value: truncateNumbers(kwentaRewards, 4),
						onClick: () => setCurrentTab(StakeTab.Staking),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.escrow.title-v2'),
				card: [
					{
						key: 'escrow-staked',
						title: t('dashboard.stake.portfolio.escrow.staked'),
						value: truncateNumbers(stakedEscrowedKwentaBalanceV2, 2),
						onClick: () => setCurrentTab(StakeTab.Escrow),
					},
					{
						key: 'escrow-vestable',
						title: t('dashboard.stake.portfolio.escrow.vestable'),
						value: truncateNumbers(totalVestableV2, 2),
						onClick: () => setCurrentTab(StakeTab.Escrow),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.escrow.title-v1'),
				card: [
					{
						key: 'escrow-staked',
						title: t('dashboard.stake.portfolio.escrow.staked'),
						value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
						onClick: () => setCurrentTab(StakeTab.Escrow),
					},
					{
						key: 'escrow-vestable',
						title: t('dashboard.stake.portfolio.escrow.vestable'),
						value: truncateNumbers(totalVestable, 2),
						onClick: () => setCurrentTab(StakeTab.Escrow),
					},
				],
			},
		],
		[
			claimableBalanceV2,
			kwentaBalance,
			kwentaRewards,
			stakedEscrowedKwentaBalance,
			stakedEscrowedKwentaBalanceV2,
			stakedKwentaBalanceV2,
			t,
			totalVestable,
			totalVestableV2,
		]
	)

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingHeading>
				<FlexDivCol rowGap="5px">
					<StyledHeading variant="h4">{t('dashboard-stake.page-title')}</StyledHeading>
					<Body color="secondary">
						Lorem ipsum dolor sit amet consectetur. Ut in nisl ut quam condimentum lacus.
					</Body>
				</FlexDivCol>
				<StyledButton
					size="xsmall"
					isRounded
					textTransform="none"
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					Docs →
				</StyledButton>
			</StakingHeading>
			<StepsContainer columnGap="15px">
				{MIGRATE_STEPS.map(({ key, copy, label, value, buttonLabel, active, onClick }, i) => (
					<StyledStakingCard key={key} $active={active}>
						<StyledHeading variant="h4">Step {i + 1}</StyledHeading>
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
								onClick={onClick}
							>
								{buttonLabel}
							</Button>
						</FlexDivRowCentered>
					</StyledStakingCard>
				))}
			</StepsContainer>
			<StakingPortfolio cards={MIGRATE_CARDS} />
			<TableContainer>
				<EscrowTable />
			</TableContainer>
		</>
	)
}

const StyledButton = styled(Button)`
	border-width: 0px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`

const TableContainer = styled.div`
	margin-top: 30px;
	${media.lessThan('mdUp')`
		margin-top: 0px;
		padding: 15px;
	`}
`

const StepsContainer = styled(FlexDivRowCentered)`
	margin: 30px 0;
	${media.lessThan('md')`
		flex-direction: column;
		row-gap: 25px;
		padding: 15px;
		margin: 0;
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

const StakingHeading = styled(FlexDivRowCentered)`
	margin-top: 20px;

	${media.lessThan('mdUp')`
		padding: 15px;
	`}
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

MigratePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default MigratePage
