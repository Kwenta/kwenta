import { formatNumber, formatTruncatedDuration } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { NO_VALUE } from 'constants/placeholder'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import EscrowTable from 'sections/dashboard/Stake/EscrowTable'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import StakingTabs from 'sections/dashboard/Stake/StakingTabs'
import { StakingCards } from 'sections/dashboard/Stake/types'
import { useFetchStakeMigrateData } from 'state/futures/hooks'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { setStakingMigrationCompleted } from 'state/staking/reducer'
import {
	selectClaimableBalance,
	selectClaimableBalanceV2,
	selectKwentaBalance,
	selectKwentaRewards,
	selectStakedEscrowedKwentaBalance,
	selectStakedEscrowedKwentaBalanceV2,
	selectStakedKwentaBalance,
	selectStakedKwentaBalanceV2,
	selectStakedResetTime,
	selectStakingMigrationCompleted,
	selectStakingMigrationRequired,
	selectTotalVestable,
	selectTotalVestableV2,
} from 'state/staking/selectors'
import media from 'styles/media'

type StakingComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const claimableBalance = useAppSelector(selectClaimableBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const totalVestable = useAppSelector(selectTotalVestable)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const claimableBalanceV2 = useAppSelector(selectClaimableBalanceV2)
	const stakedKwentaBalanceV2 = useAppSelector(selectStakedKwentaBalanceV2)
	const totalVestableV2 = useAppSelector(selectTotalVestableV2)
	const stakedEscrowedKwentaBalanceV2 = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const kwentaBalance = useAppSelector(selectKwentaBalance)
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
						value: formatNumber(kwentaBalance, { suggestDecimals: true }),
					},
					{
						key: 'balance-staked',
						title: t('dashboard.stake.portfolio.balance.staked'),
						value: formatNumber(stakedKwentaBalanceV2, { suggestDecimals: true }),
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
						value: formatNumber(stakedEscrowedKwentaBalanceV2, { suggestDecimals: true }),
					},
					{
						key: 'escrow-vestable',
						title: t('dashboard.stake.portfolio.escrow.vestable'),
						value: formatNumber(totalVestableV2, { suggestDecimals: true }),
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
						value: formatNumber(claimableBalanceV2, { suggestDecimals: true }),
					},
					{
						key: 'rewards-trading',
						title: t('dashboard.stake.portfolio.rewards.trading'),
						value: formatNumber(kwentaRewards, { suggestDecimals: true }),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.early-vest-rewards.title'),
				onClick: () => setCurrentTab(StakeTab.Staking),
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
			claimableBalanceV2,
			kwentaBalance,
			kwentaRewards,
			stakedEscrowedKwentaBalanceV2,
			stakedKwentaBalanceV2,
			t,
			timeLeft,
			totalVestableV2,
		]
	)

	const migrationInfo: StakingCards[] = useMemo(
		() => [
			{
				category: t('dashboard.stake.portfolio.balance.title'),
				card: [
					{
						key: 'balance-liquid',
						title: t('dashboard.stake.portfolio.balance.liquid'),
						value: formatNumber(kwentaBalance, { suggestDecimals: true }),
					},
					{
						key: 'balance-staked',
						title: t('dashboard.stake.portfolio.balance.staked-v1'),
						value: formatNumber(stakedKwentaBalance, { suggestDecimals: true }),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.rewards.title'),
				card: [
					{
						key: 'rewards-claimable',
						title: t('dashboard.stake.portfolio.rewards.staking-v1'),
						value: formatNumber(claimableBalance, { suggestDecimals: true }),
					},
					{
						key: 'rewards-trading',
						title: t('dashboard.stake.portfolio.rewards.trading'),
						value: formatNumber(kwentaRewards, { suggestDecimals: true }),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.escrow.title-v2'),
				card: [
					{
						key: 'escrow-staked',
						title: t('dashboard.stake.portfolio.escrow.staked'),
						value: formatNumber(stakedEscrowedKwentaBalanceV2, { suggestDecimals: true }),
					},
					{
						key: 'escrow-vestable',
						title: t('dashboard.stake.portfolio.escrow.vestable'),
						value: formatNumber(totalVestableV2, { suggestDecimals: true }),
					},
				],
			},
			{
				category: t('dashboard.stake.portfolio.escrow.title-v1'),
				card: [
					{
						key: 'escrow-staked',
						title: t('dashboard.stake.portfolio.escrow.staked'),
						value: formatNumber(stakedEscrowedKwentaBalance, { suggestDecimals: true }),
					},
					{
						key: 'escrow-vestable',
						title: t('dashboard.stake.portfolio.escrow.vestable'),
						value: formatNumber(totalVestable, { suggestDecimals: true }),
					},
				],
			},
		],
		[
			t,
			kwentaBalance,
			stakedKwentaBalance,
			claimableBalance,
			kwentaRewards,
			stakedEscrowedKwentaBalanceV2,
			totalVestableV2,
			stakedEscrowedKwentaBalance,
			totalVestable,
		]
	)

	const { title, cardsInfo, stakingComponent } = useMemo(() => {
		if (isMigrationCompleted) {
			return {
				title: t('dashboard.stake.portfolio.title'),
				cardsInfo: stakingInfo,
				stakingComponent: <StakingTabs currentTab={currentTab} onChangeTab={handleChangeTab} />,
			}
		} else {
			return {
				title: t('dashboard.stake.tabs.migrate.title'),
				cardsInfo: migrationInfo,
				stakingComponent: (
					<>
						<TableContainer>
							<EscrowTable />
						</TableContainer>
					</>
				),
			}
		}
	}, [currentTab, handleChangeTab, isMigrationCompleted, migrationInfo, stakingInfo, t])

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio
				title={title}
				cardsInfo={cardsInfo}
				isMigrationCompleted={isMigrationCompleted}
			/>
			{stakingComponent}
		</>
	)
}

const TableContainer = styled.div`
	margin-top: 15px;
	${media.lessThan('lg')`
		margin-top: 0px;
		padding: 15px;
	`}
`

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default StakingPage
