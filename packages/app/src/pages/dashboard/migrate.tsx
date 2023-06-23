import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRowCentered } from 'components/layout/flex'
import Pill from 'components/Pill'
import Spacer from 'components/Spacer'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import DashboardLayout from 'sections/dashboard/DashboardLayout'
import { StakingCard } from 'sections/dashboard/Stake/card'
import EscrowTable from 'sections/dashboard/Stake/EscrowTable'
import StakingPortfolio, { StakeTab } from 'sections/dashboard/Stake/StakingPortfolio'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { fetchClaimableRewards, fetchEscrowData, fetchStakingData } from 'state/staking/actions'

type MigrateComponent = React.FC & { getLayout: (page: ReactNode) => JSX.Element }

const MigratePage: MigrateComponent = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const dispatch = useAppDispatch()
	const walletAddress = useAppSelector(({ wallet }) => wallet.walletAddress)

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
				dispatch(fetchClaimableRewards())
			})
			dispatch(fetchEscrowData())
		}
	}, [dispatch, walletAddress])

	return (
		<>
			<Head>
				<title>{t('dashboard-stake.page-title')}</title>
			</Head>
			<StakingHeading>
				<FlexDivCol rowGap="5px">
					<StyledHeading variant="h4">Migrate to Staking V2</StyledHeading>
					<Body color="secondary">
						Lorem ipsum dolor sit amet consectetur. Ut in nisl ut quam condimentum lacus.
					</Body>
				</FlexDivCol>
				<Button
					size="xsmall"
					isRounded
					textTransform="none"
					style={{ borderWidth: '0px' }}
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					Docs →
				</Button>
			</StakingHeading>
			<Spacer height={30} />
			<FlexDivRowCentered columnGap="15px">
				<StyledStakingCard>
					<StyledHeading variant="h4">Step1</StyledHeading>
					<Body size="small" color="secondary">
						Claim any remaining rewards
					</Body>
					<Spacer height={25} />
					<FlexDivRowCentered>
						<FlexDivCol rowGap="5px">
							<Body size="small" color="secondary">
								Rewards
							</Body>
							<Body size="large" color="preview">
								100.00
							</Body>
						</FlexDivCol>
						<Pill
							color="yellow"
							size="medium"
							weight="bold"
							onClick={() => {}}
							style={{ width: '70px' }}
						>
							{t('dashboard.rewards.claim')}
						</Pill>
					</FlexDivRowCentered>
				</StyledStakingCard>
				<StyledStakingCard style={{ opacity: 0.3 }}>
					<StyledHeading variant="h4">Step2</StyledHeading>
					<Body size="small" color="secondary">
						Unstake V1 liquid balance
					</Body>
					<Spacer height={25} />
					<FlexDivRowCentered>
						<FlexDivCol rowGap="5px">
							<Body size="small" color="secondary">
								Staked
							</Body>
							<Body size="large" color="preview">
								100.00
							</Body>
						</FlexDivCol>
						<Pill
							color="yellow"
							size="medium"
							weight="bold"
							onClick={() => {}}
							style={{ width: '70px' }}
						>
							Unstake
						</Pill>
					</FlexDivRowCentered>
				</StyledStakingCard>
				<StyledStakingCard style={{ opacity: 0.3 }}>
					<StyledHeading variant="h4">Step3</StyledHeading>
					<Body size="small" color="secondary">
						Transfer liquid balance to V2
					</Body>
					<Spacer height={25} />
					<FlexDivRowCentered>
						<FlexDivCol rowGap="5px">
							<Body size="small" color="secondary">
								Staked
							</Body>
							<Body size="large" color="preview">
								100.00
							</Body>
						</FlexDivCol>
						<Pill
							color="yellow"
							size="medium"
							weight="bold"
							onClick={() => {}}
							style={{ width: '70px' }}
						>
							Stake
						</Pill>
					</FlexDivRowCentered>
				</StyledStakingCard>
			</FlexDivRowCentered>
			<Spacer height={30} />
			<StakingPortfolio setCurrentTab={setCurrentTab} />
			<Spacer height={30} />
			<EscrowTable />
		</>
	)
}

const StyledStakingCard = styled(StakingCard)`
	width: 100%;
	column-gap: 10px;
	padding: 25px;
	height: 150px;
	border: 1px solid
		${(props) => props.theme.colors.selectedTheme.newTheme.pill.yellow.outline.border};
`

const StakingHeading = styled(FlexDivRowCentered)``

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

MigratePage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default MigratePage
