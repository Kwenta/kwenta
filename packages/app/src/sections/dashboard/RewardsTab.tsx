import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils.js'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import LabelContainer from 'components/Nav/DropDownLabel'
import Select, { DropdownIndicator, IndicatorSeparator } from 'components/Select'
import { Body, Heading } from 'components/Text'
import { EXTERNAL_LINKS } from 'constants/links'
import { NO_VALUE } from 'constants/placeholder'
import useIsL2 from 'hooks/useIsL2'
import useGetFile from 'queries/files/useGetFile'
import useGetFuturesFee from 'queries/staking/useGetFuturesFee'
import useGetFuturesFeeForAccount from 'queries/staking/useGetFuturesFeeForAccount'
import {
	FuturesFeeForAccountProps,
	FuturesFeeProps,
	TradingRewardProps,
} from 'queries/staking/utils'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimMultipleAllRewards } from 'state/staking/actions'
import { setSelectedEpoch } from 'state/staking/reducer'
import {
	selectEpochData,
	selectKwentaRewards,
	selectOpRewards,
	selectSelectedEpoch,
	selectSnxOpRewards,
} from 'state/staking/selectors'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import media from 'styles/media'

type EpochValue = {
	period: number
	start: number
	end: number
	label: string
}

const RewardsTabs: FC<TradingRewardProps> = ({
	period = 0,
	start = 0,
	end = Math.floor(Date.now() / 1000),
}) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const network = useAppSelector(selectNetwork)
	const isL2 = useIsL2()
	const epochData = useAppSelector(selectEpochData)
	const selectedEpoch = useAppSelector(selectSelectedEpoch)
	const walletAddress = useAppSelector(selectWallet)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const opRewards = useAppSelector(selectOpRewards)
	const snxOpRewards = useAppSelector(selectSnxOpRewards)

	const futuresFeeQuery = useGetFuturesFeeForAccount(walletAddress!, start, end)
	const futuresFeePaid = useMemo(() => {
		const t: FuturesFeeForAccountProps[] = futuresFeeQuery.data ?? []
		return t
			.map((trade) => formatEther(trade.feesPaid.sub(trade.keeperFeesPaid).toString()))
			.reduce((acc, curr) => acc.add(wei(curr)), ZERO_WEI)
	}, [futuresFeeQuery.data])

	const totalFuturesFeeQuery = useGetFuturesFee(start, end)
	const totalFuturesFeePaid = useMemo(() => {
		const t: FuturesFeeProps[] = totalFuturesFeeQuery.data ?? []
		return t
			.map((trade) => formatEther(trade.feesKwenta.toString()))
			.reduce((acc, curr) => acc.add(wei(curr)), ZERO_WEI)
	}, [totalFuturesFeeQuery.data])

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleAllRewards())
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

	const claimDisabledAll = useMemo(
		() => kwentaRewards.add(opRewards).add(snxOpRewards).lte(0),
		[opRewards, snxOpRewards, kwentaRewards]
	)

	const ratio = useMemo(() => {
		return futuresFeePaid.gt(0) && totalFuturesFeePaid.gt(0)
			? futuresFeePaid.div(totalFuturesFeePaid)
			: ZERO_WEI
	}, [futuresFeePaid, totalFuturesFeePaid])

	const REWARDS = useMemo(
		() => [
			{
				key: 'trading-rewards',
				title: t('dashboard.rewards.trading-rewards.title'),
				copy: t('dashboard.rewards.trading-rewards.copy'),
				labels: [
					{
						label: t('dashboard.stake.portfolio.rewards.title'),
						value: truncateNumbers(kwentaRewards, 4),
					},
					{
						label: t('dashboard.stake.tabs.trading-rewards.fee-paid'),
						value: formatDollars(futuresFeePaid, { minDecimals: 2 }),
					},
					{
						label: t('dashboard.stake.tabs.trading-rewards.fee-share'),
						value: formatPercent(ratio, { minDecimals: 2 }),
					},
				],
				info: [
					{
						label: t('dashboard.stake.tabs.trading-rewards.period'),
						value: `Epoch ${period}`,
					},
					{
						label: t('dashboard.stake.tabs.trading-rewards.total-pool-fees'),
						value: formatDollars(totalFuturesFeePaid, { minDecimals: 2 }),
					},
					{
						label: t('dashboard.rewards.estimated'),
						value: truncateNumbers(wei(estimatedKwentaReward ?? ZERO_WEI), 4),
					},
				],
				kwentaIcon: true,
				linkIcon: true,
			},
			{
				key: 'op-rewards',
				title: t('dashboard.rewards.op-rewards.title'),
				copy: t('dashboard.rewards.op-rewards.copy'),
				labels: [
					{
						label: t('dashboard.stake.portfolio.rewards.title'),
						value: truncateNumbers(wei(opRewards ?? ZERO_WEI), 4),
					},
				],
				info: [
					{
						label: t('dashboard.rewards.estimated'),
						value: truncateNumbers(wei(estimatedOp ?? ZERO_WEI), 4),
					},
				],
				kwentaIcon: false,
				linkIcon: false,
			},
			{
				key: 'snx-rewards',
				title: t('dashboard.rewards.snx-rewards.title'),
				copy: t('dashboard.rewards.snx-rewards.copy'),
				labels: [
					{
						label: t('dashboard.stake.portfolio.rewards.title'),
						value: truncateNumbers(wei(snxOpRewards ?? ZERO_WEI), 4),
					},
				],
				info: [
					{
						label: t('dashboard.rewards.estimated'),
						value: NO_VALUE,
					},
				],
				kwentaIcon: false,
				linkIcon: false,
			},
		],
		[
			estimatedKwentaReward,
			estimatedOp,
			futuresFeePaid,
			kwentaRewards,
			opRewards,
			period,
			ratio,
			snxOpRewards,
			t,
			totalFuturesFeePaid,
		]
	)

	const handleChangeEpoch = useCallback(
		(value: EpochValue) => () => {
			dispatch(setSelectedEpoch(value.period))
		},
		[dispatch]
	)

	const formatOptionLabel = useCallback(
		(option: EpochValue) => (
			<div onClick={handleChangeEpoch(option)}>
				<SelectLabelContainer>{option.label}</SelectLabelContainer>
			</div>
		),
		[handleChangeEpoch]
	)

	return (
		<RewardsTabContainer>
			<HeaderContainer>
				<StyledHeading variant="h4">{t('dashboard.rewards.title')}</StyledHeading>
				<StyledFlexDivRowCentered>
					<StakingSelect
						formatOptionLabel={formatOptionLabel}
						controlHeight={33}
						options={epochData.sort((a, b) => b.period - a.period)}
						optionPadding="0px"
						value={selectedEpoch}
						menuWidth={110}
						components={{ IndicatorSeparator, DropdownIndicator }}
						isSearchable={false}
						variant="flat"
						isDisabled={!isL2}
					/>
					<StyledButton
						size="xsmall"
						isRounded
						textTransform="none"
						onClick={() => window.open(EXTERNAL_LINKS.Docs.Staking, '_blank')}
					>
						Docs →
					</StyledButton>
				</StyledFlexDivRowCentered>
			</HeaderContainer>
			<CardsContainer>
				{REWARDS.map(({ key, title, copy, labels, info }) => (
					<CardGrid key={key}>
						<div>
							<Body size="large" color="primary">
								{title}
							</Body>
							<Body color="secondary">{copy}</Body>
						</div>
						<RewardsContainer>
							<FlexDivRow justifyContent="flex-start" columnGap="25px">
								{labels.map(({ label, value }) => (
									<FlexDivCol rowGap="5px">
										<Body color="secondary">{label}</Body>
										<Body size="large" color="preview">
											{value}
										</Body>
									</FlexDivCol>
								))}
							</FlexDivRow>
							<FlexDivRow justifyContent="flex-start" columnGap="25px">
								{info.map(({ label, value }) => (
									<FlexDivCol rowGap="5px">
										<Body color="secondary">{label}</Body>
										<Body size="large" color="primary">
											{value}
										</Body>
									</FlexDivCol>
								))}
							</FlexDivRow>
						</RewardsContainer>
					</CardGrid>
				))}
				<ButtonContainer>
					<Button
						variant="yellow"
						size="small"
						textTransform="uppercase"
						isRounded
						disabled={claimDisabledAll}
						onClick={handleClaimAll}
					>
						Claim
					</Button>
				</ButtonContainer>
			</CardsContainer>
		</RewardsTabContainer>
	)
}

const SelectLabelContainer = styled(LabelContainer)`
	font-size: 12px;
`

const StakingSelect = styled(Select)`
	height: 33px;
	width: 100%;
	.react-select__control,
	.react-select__menu,
	.react-select__menu-list {
		border-radius: 20px;
		background: ${(props) => props.theme.colors.selectedTheme.surfaceFill};
	}

	.react-select__value-container {
		padding: 0;
	}

	.react-select__single-value > div > div {
		font-size: 12px;
	}

	.react-select__dropdown-indicator {
		margin-right: 10px;
	}
`

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	width: 200px;
	column-gap: 25px;
	${media.lessThan('mdUp')`
		width: 185px;
		column-gap: 10px;
	`}
`

const ButtonContainer = styled.div`
	margin-bottom: 25px;
	margin-left: 25px;
	width: 100%;
	display: flex;
`

const StyledButton = styled(Button)`
	border-width: 0px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
`

const RewardsContainer = styled(FlexDivCol)`
	row-gap: 25px;
	${media.lessThan('lg')`
		flex-direction: row;
		column-gap: 25px;
		flex-wrap: wrap;
	`}
`

const StyledHeading = styled(Heading)`
	font-weight: 400;
`

const HeaderContainer = styled(FlexDivRowCentered)`
	margin-bottom: 22.5px;

	${media.lessThan('mdUp')`
		margin-bottom: 25px;
		margin-top: 25px;
	`}
`

const RewardsTabContainer = styled.div`
	${media.lessThan('mdUp')`
		padding: 0;
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
`

const CardsContainer = styled(FlexDivRow)`
	width: 100%;
	justify-content: flex-start;
	column-gap: 5px;
	background: ${(props) => props.theme.colors.selectedTheme.newTheme.containers.cards.background};
	border-radius: 15px;
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.newTheme.border.color};
	flex: 1 1 0;
	flex-wrap: wrap;
`

export default RewardsTabs
