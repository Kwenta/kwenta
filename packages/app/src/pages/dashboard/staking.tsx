import { formatTruncatedDuration, truncateNumbers } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NO_VALUE } from 'constants/placeholder'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import StakingTabs from 'sections/dashboard/Stake/StakingTabs'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	fetchClaimableRewards,
	fetchEscrowData,
	fetchStakingData,
	fetchStakingV2Data,
} from 'state/staking/actions'
import {
	selectClaimableBalanceV2,
	selectKwentaBalance,
	selectKwentaRewards,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakedKwentaBalanceV2,
	selectStakedResetTime,
	selectTotalVestableV2,
} from 'state/staking/selectors'
import { selectWallet } from 'state/wallet/selectors'

type StakingComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

type StakingCard = {
	key: string
	title: string
	value: string
	onClick: () => void
}

export type StakingCards = {
	category: string
	card: StakingCard[]
}

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const walletAddress = useAppSelector(selectWallet)
	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalanceV2)
	const totalVestable = useAppSelector(selectTotalVestableV2)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const claimableBalance = useAppSelector(selectClaimableBalanceV2)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const stakedResetTime = useAppSelector(selectStakedResetTime)

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

	useEffect(() => {
		if (!!walletAddress) {
			dispatch(fetchStakingData()).then(() => {
				dispatch(fetchStakingV2Data())
				dispatch(fetchClaimableRewards())
			})
			dispatch(fetchEscrowData())
		}
	}, [dispatch, walletAddress])

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

	const STAKING_CARDS: StakingCards[] = [
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
					value: truncateNumbers(stakedKwentaBalance, 2),
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.escrow.title'),
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
		{
			category: t('dashboard.stake.portfolio.rewards.title'),
			card: [
				{
					key: 'rewards-claimable',
					title: t('dashboard.stake.portfolio.rewards.claimable'),
					value: truncateNumbers(claimableBalance, 2),
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
				{
					key: 'rewards-trading',
					title: t('dashboard.stake.portfolio.rewards.trading'),
					value: truncateNumbers(kwentaRewards, 2),
					onClick: () => setCurrentTab(StakeTab.Staking),
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
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
				{
					key: 'early-vest-rewards-epoch',
					title: t('dashboard.stake.portfolio.early-vest-rewards.epoch'),
					value: NO_VALUE,
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
			],
		},
		{
			category: t('dashboard.stake.portfolio.cooldown.title'),
			card: [
				{
					key: 'cooldown-time-left',
					title: t('dashboard.stake.portfolio.cooldown.time-left'),
					value: timeLeft,
					onClick: () => setCurrentTab(StakeTab.Staking),
				},
			],
		},
	]

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio cards={STAKING_CARDS} />
			<StakingTabs currentTab={currentTab} onChangeTab={handleChangeTab} />
		</>
	)
}

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default StakingPage
