import { formatDollars, formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { useRouter } from 'next/router'
import { FC, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TabButton from 'components/Button/TabButton'
import { TabPanel } from 'components/Tab'
import ROUTES from 'constants/routes'
import { useAppSelector } from 'state/hooks'
import {
	selectBoostNft,
	selectCumulativeStatsByCode,
	selectMintedBoostNft,
	selectReferralCodes,
	selectReferralEpoch,
} from 'state/referrals/selectors'
import media from 'styles/media'

import AffiliatesProfiles from './AffiliatesProfiles'
import { REFFERAL_TIERS } from './constants'
import ReferralCodes from './ReferralCodes'
import ReferralRewardsHistory from './ReferralRewardsHistory'
import { ReferralsHeading } from './ReferralsHeading'
import ReferrersDashboard from './ReferrersDashboard'
import { ReferralsTab } from './types'
import { calculateTotal } from './utils'

type ReferralsTabsProp = {
	currentTab: ReferralsTab
	onChangeTab(tab: ReferralsTab): () => void
}

const ReferralsTabs: FC<ReferralsTabsProp> = memo(({ currentTab, onChangeTab }) => {
	const { t } = useTranslation()
	const router = useRouter()
	const referralsCodes = useAppSelector(selectReferralCodes)
	const referralsEpoch = useAppSelector(selectReferralEpoch)
	const { totalVolume, totalTraders } = useAppSelector(selectCumulativeStatsByCode)
	const totalRewards = calculateTotal(referralsEpoch, 'earnedRewards')
	const hasMinted = useAppSelector(selectMintedBoostNft)
	const boostNftTier = useAppSelector(selectBoostNft)

	const { boost, icon } = REFFERAL_TIERS[boostNftTier]

	const goToRewardsTab = useCallback(() => router.push(ROUTES.Dashboard.TradingRewards), [router])

	const tradersMetrics = useMemo(
		() => [
			{
				key: 'rewards-boost',
				label: t('referrals.traders.dashboard.rewards-boost'),
				value: hasMinted
					? formatPercent(boost, { suggestDecimals: true, maxDecimals: 2 })
					: 'Boost NFT not minted',
				icon: hasMinted ? icon : undefined,
			},
			{
				key: 'total-volume',
				label: t('referrals.traders.dashboard.total-volume'),
				value: formatDollars(totalVolume, { suggestDecimals: true }),
			},
			{
				key: 'kwenta-earned',
				label: t('referrals.traders.dashboard.kwenta-earned'),
				value: formatNumber(totalRewards, { suggestDecimals: true }),
				buttonLabel: t('referrals.traders.staking'),
				onClick: goToRewardsTab,
			},
		],
		[boost, goToRewardsTab, hasMinted, icon, t, totalRewards, totalVolume]
	)

	const affiliatesMetrics = useMemo(
		() => [
			{
				key: 'traders-referred',
				label: t('referrals.affiliates.dashboard.traders-referred'),
				value: totalTraders.toString(),
			},
			{
				key: 'trading-volume',
				label: t('referrals.affiliates.dashboard.trading-volume'),
				value: formatDollars(totalVolume, { suggestDecimals: true }),
			},
			{
				key: 'kwenta-earned',
				label: t('referrals.affiliates.dashboard.kwenta-earned'),
				value: formatNumber(totalRewards, { suggestDecimals: true }),
			},
		],
		[t, totalRewards, totalTraders, totalVolume]
	)

	return (
		<ReferralsTabsContainer>
			<ReferralsHeading title={t('referrals.title')} copy={t('referrals.copy')} />
			{process.env.NEXT_PUBLIC_ENABLE_AFFILIATE === 'true' && (
				<ReferralsTabsHeader>
					<TabButtons>
						<TabButton
							variant="noOutline"
							title={t('referrals.traders.title')}
							onClick={onChangeTab(ReferralsTab.Traders)}
							active={currentTab === ReferralsTab.Traders}
						/>
						<TabButton
							variant="noOutline"
							title={t('referrals.affiliates.title')}
							onClick={onChangeTab(ReferralsTab.Affiliates)}
							active={currentTab === ReferralsTab.Affiliates}
						/>
					</TabButtons>
				</ReferralsTabsHeader>
			)}
			<div>
				<TabPanel name={ReferralsTab.Traders} activeTab={currentTab}>
					<ReferrersDashboard data={tradersMetrics} />
					<ReferralRewardsHistory data={referralsEpoch} />
				</TabPanel>
				<TabPanel name={ReferralsTab.Affiliates} activeTab={currentTab}>
					<ReferrersDashboard data={affiliatesMetrics} />
					<AffiliatesProfiles />
					<ReferralCodes data={referralsCodes} />
				</TabPanel>
			</div>
		</ReferralsTabsContainer>
	)
})

const ReferralsTabsHeader = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 30px;
	margin-bottom: 30px;

	${media.lessThan('lg')`
		flex-direction: column;
		row-gap: 10px;
		margin-bottom: 25px;
		margin-top: 0px;
	`}
`

const ReferralsTabsContainer = styled.div`
	${media.lessThan('lg')`
		padding: 15px;
	`}
`

const TabButtons = styled.div`
	display: flex;

	& > button:not(:last-of-type) {
		margin-right: 25px;
	}

	${media.lessThan('lg')`
		justify-content: flex-start;
	`}
`

export default ReferralsTabs
