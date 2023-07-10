import { formatTruncatedDuration, truncateNumbers } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import { NO_VALUE } from 'constants/placeholder'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import StakingTabs from 'sections/dashboard/Stake/StakingTabs'
import { useFetchStakeMigrateData } from 'state/futures/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setStakingMigrationCompleted } from 'state/staking/reducer'
import {
	selectClaimableBalanceV2,
	selectKwentaBalance,
	selectKwentaRewards,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakedKwentaBalanceV2,
	selectStakedResetTime,
	selectStakingMigrationCompleted,
	selectStakingMigrationRequired,
	selectTotalVestableV2,
} from 'state/staking/selectors'

import MigratePage from './migrate'

type StakingComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

type StakingCard = {
	key: string
	title: string
	value: string
	onClick?: () => void
}

export type StakingCards = {
	category: string
	card: StakingCard[]
	onClick?: () => void
	icon?: React.ReactNode
	flex?: number
}

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const claimableBalance = useAppSelector(selectClaimableBalanceV2)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalanceV2)
	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const totalVestable = useAppSelector(selectTotalVestableV2)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const stakedResetTime = useAppSelector(selectStakedResetTime)
	const isMigrationRequired = useAppSelector(selectStakingMigrationRequired)
	const isMigrationCompleted = useAppSelector(selectStakingMigrationCompleted)

	useFetchStakeMigrateData()

	useEffect(() => {
		if (isMigrationRequired) {
			dispatch(setStakingMigrationCompleted(false))
		}
	}, [dispatch, isMigrationRequired])

	const tabQuery = useMemo(() => {
		if (router.query.tab) {
			const tab = router.query.tab as StakeTab
			if (Object.values(StakeTab).includes(tab)) {
				return tab
			}
		}
		return null
	}, [router])

	const [currentTab, setCurrentTab] = useState(tabQuery ?? StakeTab.Staking)

	const handleChangeTab = useCallback(
		(tab: StakeTab) => () => {
			setCurrentTab(tab)
		},
		[]
	)

	const timeLeft = useMemo(
		() =>
			stakedResetTime > new Date().getTime() / 1000
				? formatTruncatedDuration(stakedResetTime - new Date().getTime() / 1000)
				: NO_VALUE,
		[stakedResetTime]
	)

	const stakingInfo: StakingCards[] = useMemo(
		() => [
			{
				category: t('dashboard.stake.portfolio.balance.title'),
				onClick: () => setCurrentTab(StakeTab.Staking),
				card: [
					{
						key: 'balance-liquid',
						title: t('dashboard.stake.portfolio.balance.liquid'),
						value: truncateNumbers(kwentaBalance, 2),
					},
					{
						key: 'balance-staked',
						title: t('dashboard.stake.portfolio.balance.staked'),
						value: truncateNumbers(stakedKwentaBalance, 2),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.escrow.title'),
				onClick: () => setCurrentTab(StakeTab.Escrow),
				card: [
					{
						key: 'escrow-staked',
						title: t('dashboard.stake.portfolio.escrow.staked'),
						value: truncateNumbers(stakedEscrowedKwentaBalance, 2),
					},
					{
						key: 'escrow-vestable',
						title: t('dashboard.stake.portfolio.escrow.vestable'),
						value: truncateNumbers(totalVestable, 2),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.rewards.title'),
				onClick: () => setCurrentTab(StakeTab.Staking),
				card: [
					{
						key: 'rewards-claimable',
						title: t('dashboard.stake.portfolio.rewards.claimable'),
						value: truncateNumbers(claimableBalance, 2),
					},
					{
						key: 'rewards-trading',
						title: t('dashboard.stake.portfolio.rewards.trading'),
						value: truncateNumbers(kwentaRewards, 2),
					},
				],
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
			},
			{
				category: t('dashboard.stake.portfolio.cooldown.title'),
				onClick: () => setCurrentTab(StakeTab.Staking),
				card: [
					{
						key: 'cooldown-time-left',
						title: t('dashboard.stake.portfolio.cooldown.time-left'),
						value: timeLeft,
					},
				],
			},
		],
		[
			claimableBalance,
			kwentaBalance,
			kwentaRewards,
			stakedEscrowedKwentaBalance,
			stakedKwentaBalance,
			t,
			timeLeft,
			totalVestable,
		]
	)

	return isMigrationCompleted ? (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio cards={stakingInfo} />
			<StakingTabs currentTab={currentTab} onChangeTab={handleChangeTab} />
		</>
	) : (
		<MigratePage />
	)
}

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default StakingPage
