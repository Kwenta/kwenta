import { ZERO_WEI } from '@kwenta/sdk/constants'
import { truncateNumbers } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { useRouter } from 'next/router'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import Pill from 'components/Pill'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import ROUTES from 'constants/routes'
import useGetFile from 'queries/files/useGetFile'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	claimMultipleAllRewards,
	claimMultipleOpRewards,
	claimMultipleSnxOpRewards,
} from 'state/staking/actions'
import {
	selectEpochPeriod,
	selectKwentaRewards,
	selectOpRewards,
	selectSnxOpRewards,
} from 'state/staking/selectors'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import media from 'styles/media'

const RewardsTabs: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const router = useRouter()
	const network = useAppSelector(selectNetwork)
	const walletAddress = useAppSelector(selectWallet)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const opRewards = useAppSelector(selectOpRewards)
	const snxOpRewards = useAppSelector(selectSnxOpRewards)
	const epoch = useAppSelector(selectEpochPeriod)

	const goToStaking = useCallback(() => {
		router.push(ROUTES.Dashboard.TradingRewards)
	}, [router])

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleAllRewards())
	}, [dispatch])

	const handleClaimOp = useCallback(() => {
		dispatch(claimMultipleOpRewards())
	}, [dispatch])

	const handleClaimOpSnx = useCallback(() => {
		dispatch(claimMultipleSnxOpRewards())
	}, [dispatch])

	const estimatedKwentaRewardQuery = useGetFile(
		`trading-rewards-snapshots/${network === 420 ? `goerli-` : ''}epoch-current.json`
	)
	const estimatedKwentaReward = useMemo(
		() => BigNumber.from(estimatedKwentaRewardQuery?.data?.claims[walletAddress!]?.amount ?? 0),
		[estimatedKwentaRewardQuery?.data?.claims, walletAddress]
	)

	const estimatedOpQuery = useGetFile(
		`trading-rewards-snapshots/${network === 420 ? `goerli-` : ''}epoch-current-op.json`
	)
	const estimatedOp = useMemo(
		() => BigNumber.from(estimatedOpQuery?.data?.claims[walletAddress!]?.amount ?? 0),
		[estimatedOpQuery?.data?.claims, walletAddress]
	)

	const claimDisabledAll = useMemo(() => kwentaRewards.add(opRewards).add(snxOpRewards).lte(0), [
		opRewards,
		snxOpRewards,
		kwentaRewards,
	])

	const claimDisabledKwentaOp = useMemo(() => opRewards.lte(0), [opRewards])

	const claimDisabledSnxOp = useMemo(() => snxOpRewards.lte(0), [snxOpRewards])

	const REWARDS = [
		{
			key: 'trading-rewards',
			title: t('dashboard.rewards.trading-rewards.title'),
			copy: t('dashboard.rewards.trading-rewards.copy'),
			button: (
				<Pill
					color="yellow"
					size="large"
					weight="bold"
					onClick={handleClaimAll}
					style={{ width: '100px' }}
				>
					{t('dashboard.rewards.claim')}
				</Pill>
			),
			labels: [
				{
					label: t('dashboard.rewards.rewards'),
					value: truncateNumbers(wei(estimatedKwentaReward ?? ZERO_WEI), 4),
				},
				{
					label: 'Fee Paid',
					value: '$2000.00',
				},
				{
					label: 'Fee Share',
					value: '100%',
				},
			],
			info: [
				{
					label: 'Period',
					value: `Epoch ${Number(epoch)}`,
				},
				{
					label: 'Total Pool Fees',
					value: '$1,000,000.00',
				},
			],
			kwentaIcon: true,
			linkIcon: true,
			rewards: kwentaRewards,
			onClick: goToStaking,
			isDisabled: false,
		},
		{
			key: 'op-rewards',
			title: t('dashboard.rewards.op-rewards.title'),
			copy: t('dashboard.rewards.op-rewards.copy'),
			button: (
				<Pill
					color="yellow"
					size="large"
					weight="bold"
					onClick={handleClaimAll}
					disabled={claimDisabledAll}
					style={{ width: '100px', borderWidth: '0px' }}
				/>
			),
			labels: [
				{
					label: 'Rewards',
					value: truncateNumbers(wei(estimatedOp ?? ZERO_WEI), 4),
				},
			],
			info: [
				{
					label: t('dashboard.rewards.estimated'),
					value: '100.0000',
				},
			],
			kwentaIcon: false,
			linkIcon: false,
			rewards: opRewards,
			estimatedRewards: truncateNumbers(wei(estimatedOp ?? ZERO_WEI), 4),
			onClick: handleClaimOp,
			isDisabled: claimDisabledKwentaOp,
		},
		{
			key: 'snx-rewards',
			title: t('dashboard.rewards.snx-rewards.title'),
			copy: t('dashboard.rewards.snx-rewards.copy'),
			button: (
				<Pill
					color="yellow"
					size="large"
					weight="bold"
					onClick={handleClaimAll}
					disabled={claimDisabledAll}
					style={{ width: '100px', borderWidth: '0px' }}
				/>
			),
			labels: [
				{
					label: 'Rewards',
					value: truncateNumbers(wei(estimatedOp ?? ZERO_WEI), 4),
				},
			],
			info: [
				{
					label: t('dashboard.rewards.estimated'),
					value: '100.0000',
				},
			],
			kwentaIcon: false,
			linkIcon: false,
			rewards: snxOpRewards,
			onClick: handleClaimOpSnx,
			isDisabled: claimDisabledSnxOp,
		},
	]

	return (
		<RewardsTabContainer>
			<HeaderContainer>
				<StyledHeading variant="h4">{t('dashboard.rewards.title')}</StyledHeading>
				<Button
					size="xsmall"
					isRounded
					textTransform="none"
					style={{ borderWidth: '0px' }}
					onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
				>
					Docs →
				</Button>
			</HeaderContainer>
			<CardsContainer>
				{REWARDS.map(({ key, title, copy, labels, info, button }) => (
					<CardGrid key={key}>
						<div>
							<Body size="medium" color="primary">
								{title}
							</Body>
							<Body size="small" color="secondary">
								{copy}
							</Body>
						</div>
						<FlexDivRow justifyContent="flex-start" columnGap="25px">
							{labels.map(({ label, value }) => (
								<FlexDivCol rowGap="5px">
									<Body size="small" color="secondary">
										{label}
									</Body>
									<Body size="medium" color="preview">
										{value}
									</Body>
								</FlexDivCol>
							))}
						</FlexDivRow>
						<FlexDivRowCentered justifyContent="flex-start" columnGap="25px">
							{info.map(({ label, value }) => (
								<FlexDivCol rowGap="5px">
									<Body size="small" color="secondary">
										{label}
									</Body>
									<Body size="small" color="primary">
										{value}
									</Body>
								</FlexDivCol>
							))}
						</FlexDivRowCentered>
						{button}
					</CardGrid>
				))}
			</CardsContainer>
		</RewardsTabContainer>
	)
}

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const HeaderContainer = styled(FlexDivRowCentered)`
	margin-bottom: 22.5px;

	${media.lessThan('mdUp')`
		flex-direction: column;
		row-gap: 15px;
	`}
`

const RewardsTabContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 15px;
	`}

	${media.greaterThan('mdUp')`
		margin-top: 26px;
		margin-bottom: 60px;
	`}
`

const CardGrid = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	row-gap: 25px;
	background: transparent;
	border-width: 0px;

	.title {
		font-weight: 400;
		font-size: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.primary};
	}

	.value {
		font-size: 13px;
		line-height: 16px;
		color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
		margin-top: 0px;
		font-family: ${(props) => props.theme.fonts.regular};
	}
`

const CardsContainer = styled(FlexDivRow)`
	width: 100%;
	justify-content: flex-start;
	column-gap: 5px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	border-radius: 15px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};

	${media.lessThan('mdUp')`
		grid-template-columns: repeat(1, 1fr);
	`}
`

export default RewardsTabs
