import { formatNumber, formatTruncatedDuration } from '@kwenta/sdk/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FlexDivCol } from 'components/layout/flex'
import { NO_VALUE } from 'constants/placeholder'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import EscrowTable from 'sections/dashboard/Stake/EscrowTable'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import StakingTab from 'sections/dashboard/Stake/StakingTab'
import StakingTabs from 'sections/dashboard/Stake/StakingTabs'
import { StakingCards } from 'sections/dashboard/Stake/types'
import { useFetchStakeMigrateData } from 'state/futures/hooks'
import { useAppSelector } from 'state/hooks'
import {
	selectClaimableBalance,
	selectEscrowedKwentaBalance,
	selectKwentaBalance,
	selectKwentaRewards,
	selectStakedEscrowedKwentaBalance,
	selectStakedKwentaBalance,
	selectStakedResetTime,
	selectStakingV1,
	selectTotalVestable,
} from 'state/staking/selectors'
import { selectStartMigration } from 'state/stakingMigration/selectors'
import media from 'styles/media'

import MigratePage from './migrate'

type StakingComponent = FC & { getLayout: (page: ReactNode) => JSX.Element }

const StakingPage: StakingComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const claimableBalance = useAppSelector(selectClaimableBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const totalVestable = useAppSelector(selectTotalVestable)
	const escrowedBalance = useAppSelector(selectEscrowedKwentaBalance)
	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const stakedResetTime = useAppSelector(selectStakedResetTime)
	const stakingV1 = useAppSelector(selectStakingV1)
	const startMigration = useAppSelector(selectStartMigration)

	useFetchStakeMigrateData()

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
			stakedResetTime > Date.now() / 1000
				? formatTruncatedDuration(stakedResetTime - Date.now() / 1000)
				: NO_VALUE,
		[stakedResetTime]
	)

	const stakingInfo: StakingCards[] = useMemo(
		() => [
			{
				key: 'balance',
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
						value: formatNumber(stakedKwentaBalance, { suggestDecimals: true }),
						hidden: stakingV1,
					},
					{
						key: 'balance-escrow',
						title: t('dashboard.stake.portfolio.balance.escrow'),
						value: formatNumber(escrowedBalance, { suggestDecimals: true }),
						hidden: !stakingV1,
					},
				],
			},
			{
				key: 'escrow',
				category: t('dashboard.stake.portfolio.escrow.title'),
				onClick: () => setCurrentTab(StakeTab.Escrow),
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
				hidden: stakingV1,
			},
			{
				key: 'rewards',
				category: t('dashboard.stake.portfolio.rewards.title'),
				onClick: () => setCurrentTab(StakeTab.Staking),
				card: [
					{
						key: 'rewards-claimable',
						title: t('dashboard.stake.portfolio.rewards.claimable'),
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
				key: 'cooldown',
				category: t('dashboard.stake.portfolio.cooldown.title'),
				card: [
					{
						key: 'cooldown-time-left',
						title: t('dashboard.stake.portfolio.cooldown.time-left'),
						value: timeLeft,
					},
				],
				hidden: stakingV1,
			},
			{
				key: 'escrow-v1',
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
				hidden: !stakingV1,
			},
		],
		[
			claimableBalance,
			escrowedBalance,
			kwentaBalance,
			kwentaRewards,
			stakedEscrowedKwentaBalance,
			stakedKwentaBalance,
			stakingV1,
			t,
			timeLeft,
			totalVestable,
		]
	)

	const { title, cardsInfo, stakingComponent } = useMemo(() => {
		return stakingV1
			? {
					title: t('dashboard.stake.portfolio.title-v1'),
					cardsInfo: stakingInfo.filter((info) => !info.hidden),
					stakingComponent: (
						<StakingV1Container>
							<StakingTab />
							<EscrowTable />
						</StakingV1Container>
					),
			  }
			: {
					title: t('dashboard.stake.portfolio.title'),
					cardsInfo: stakingInfo.filter((info) => !info.hidden),
					stakingComponent: <StakingTabs currentTab={currentTab} onChangeTab={handleChangeTab} />,
			  }
	}, [currentTab, handleChangeTab, stakingInfo, stakingV1, t])

	return startMigration ? (
		<MigratePage />
	) : (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingPortfolio title={title} cardsInfo={cardsInfo} />
			{stakingComponent}
		</>
	)
}

const StakingV1Container = styled(FlexDivCol)`
	margin-top: 20px;
	row-gap: 30px;
	${media.lessThan('lg')`
		padding: 0 15px;
		margin-top: 15px;
		row-gap: 25px;
	`}
`

StakingPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default StakingPage
