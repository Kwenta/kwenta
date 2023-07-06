import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, formatTruncatedDuration, truncateNumbers } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NO_VALUE } from 'constants/placeholder'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import StakingTabs from 'sections/dashboard/Stake/StakingTabs'
import { selectKwentaPrice, selectOpPrice } from 'state/earn/selectors'
import { useFetchStakeMigrateData } from 'state/futures/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	selectClaimableBalance,
	selectClaimableBalanceV2,
	selectKwentaBalance,
	selectKwentaRewards,
	selectOpRewards,
	selectSnxOpRewards,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakedKwentaBalance,
	selectStakedKwentaBalanceV2,
	selectStakedResetTime,
	selectTotalVestableV2,
} from 'state/staking/selectors'
import { selectWallet } from 'state/wallet/selectors'

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
}

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const walletAddress = useAppSelector(selectWallet)
	const claimableBalanceV1 = useAppSelector(selectClaimableBalance)
	const claimableBalance = useAppSelector(selectClaimableBalanceV2)
	const stakedKwentaBalanceV1 = useAppSelector(selectStakedKwentaBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalanceV2)
	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const totalVestable = useAppSelector(selectTotalVestableV2)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const stakedResetTime = useAppSelector(selectStakedResetTime)
	const [rewardBalance, setRewardBalance] = useState(ZERO_WEI)
	const opRewards = useAppSelector(selectOpRewards)
	const snxOpRewards = useAppSelector(selectSnxOpRewards)
	const opPrice = useAppSelector(selectOpPrice)
	const kwentaPrice = useAppSelector(selectKwentaPrice)

	useFetchStakeMigrateData()

	const isMigrationActive = useMemo(
		() => claimableBalanceV1.gt(ZERO_WEI) || stakedKwentaBalanceV1.gt(ZERO_WEI),
		[claimableBalanceV1, stakedKwentaBalanceV1]
	)

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
			setRewardBalance(kwentaPrice.mul(kwentaRewards).add(opPrice.mul(opRewards.add(snxOpRewards))))
		}
	}, [dispatch, kwentaPrice, kwentaRewards, opPrice, opRewards, snxOpRewards, walletAddress])

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
						value: formatDollars(rewardBalance, { maxDecimals: 2 }),
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
			rewardBalance,
			stakedEscrowedKwentaBalance,
			stakedKwentaBalance,
			t,
			timeLeft,
			totalVestable,
		]
	)

	return isMigrationActive ? (
		<MigratePage />
	) : (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio cards={stakingInfo} />
			<StakingTabs currentTab={currentTab} onChangeTab={handleChangeTab} />
		</>
	)
}

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default StakingPage
