import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, formatNumber, formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import OptimismLogo from 'assets/svg/providers/optimism.svg'
import Button from 'components/Button'
import { FlexDivCol, FlexDivRow, FlexDivRowCentered } from 'components/layout/flex'
import LabelContainer from 'components/Nav/DropDownLabel'
import Select, { DropdownIndicator, IndicatorSeparator } from 'components/Select'
import { Body, Heading } from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'
import { NO_VALUE } from 'constants/placeholder'
import useIsL2 from 'hooks/useIsL2'
import { TradingRewardProps } from 'queries/staking/utils'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { selectFuturesFees, selectFuturesFeesForAccount } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { claimMultipleAllRewards } from 'state/staking/actions'
import { setSelectedEpoch } from 'state/staking/reducer'
import {
	selectEpochData,
	selectEstimatedKwentaRewards,
	selectEstimatedOpRewards,
	selectIsClaimingAllRewards,
	selectKwentaRewards,
	selectOpRewards,
	selectSelectedEpoch,
	selectSnxOpRewards,
} from 'state/staking/selectors'
import media from 'styles/media'

import { EpochValue, RewardsInfo } from './types'

const RewardsTab: FC<TradingRewardProps> = ({ period = 0 }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const isL2 = useIsL2()
	const epochData = useAppSelector(selectEpochData)
	const selectedEpoch = useAppSelector(selectSelectedEpoch)
	const kwentaRewards = useAppSelector(selectKwentaRewards)
	const opRewards = useAppSelector(selectOpRewards)
	const snxOpRewards = useAppSelector(selectSnxOpRewards)
	const estimatedKwentaRewards = useAppSelector(selectEstimatedKwentaRewards)
	const estimatedOpRewards = useAppSelector(selectEstimatedOpRewards)
	const futuresFeePaid = useAppSelector(selectFuturesFeesForAccount)
	const totalFuturesFeePaid = useAppSelector(selectFuturesFees)
	const isClaimingAllRewards = useAppSelector(selectIsClaimingAllRewards)

	const handleClaimAll = useCallback(() => {
		dispatch(claimMultipleAllRewards())
	}, [dispatch])

	const claimDisabledAll = useMemo(
		() => kwentaRewards.add(opRewards).add(snxOpRewards).eq(0) || isClaimingAllRewards,
		[kwentaRewards, opRewards, snxOpRewards, isClaimingAllRewards]
	)

	const ratio = useMemo(() => {
		return !!futuresFeePaid && wei(totalFuturesFeePaid).gt(0)
			? wei(futuresFeePaid).div(totalFuturesFeePaid)
			: ZERO_WEI
	}, [futuresFeePaid, totalFuturesFeePaid])

	const rewardsInfo: RewardsInfo[] = useMemo(
		() => [
			{
				key: 'trading-rewards',
				title: t('dashboard.rewards.trading-rewards.title'),
				copy: t('dashboard.rewards.trading-rewards.copy'),
				labels: [
					{
						label: t('dashboard.stake.portfolio.rewards.title'),
						value: formatNumber(kwentaRewards, { minDecimals: 4 }),
					},
					{
						label: t('dashboard.stake.tabs.trading-rewards.fee-paid'),
						labelIcon: (
							<CustomStyledTooltip
								width="200px"
								height="auto"
								content={t('dashboard.stake.tabs.trading-rewards.trading-rewards-tooltip')}
							>
								<WithCursor cursor="help">
									<HelpIcon />
								</WithCursor>
							</CustomStyledTooltip>
						),
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
						labelIcon: (
							<CustomStyledTooltip
								width="260px"
								height="auto"
								content={t('dashboard.stake.tabs.trading-rewards.estimated-info')}
							>
								<WithCursor cursor="help">
									<HelpIcon />
								</WithCursor>
							</CustomStyledTooltip>
						),
						value: formatNumber(estimatedKwentaRewards, { minDecimals: 4 }),
					},
				],
			},
			{
				key: 'op-rewards',
				title: t('dashboard.rewards.op-rewards.title'),
				copy: t('dashboard.rewards.op-rewards.copy'),
				labels: [
					{
						label: t('dashboard.stake.portfolio.rewards.title'),
						value: formatNumber(opRewards, { minDecimals: 4 }),
						valueIcon: <OptimismLogo height={18} width={18} />,
					},
				],
				info: [
					{
						label: t('dashboard.rewards.estimated'),
						value: formatNumber(estimatedOpRewards, { minDecimals: 4 }),
					},
				],
			},
			{
				key: 'snx-rewards',
				title: t('dashboard.rewards.snx-rewards.title'),
				copy: t('dashboard.rewards.snx-rewards.copy'),
				labels: [
					{
						label: t('dashboard.stake.portfolio.rewards.title'),
						value: formatNumber(snxOpRewards, { minDecimals: 4 }),
						valueIcon: <OptimismLogo height={18} width={18} />,
					},
				],
				info: [
					{
						label: t('dashboard.rewards.estimated'),
						value: NO_VALUE,
					},
				],
			},
		],
		[
			estimatedKwentaRewards,
			estimatedOpRewards,
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
			</HeaderContainer>
			<CardsContainer>
				{rewardsInfo.map(({ key, title, copy, labels, info }) => (
					<CardGrid key={key}>
						<div>
							<Body size="large" color="primary">
								{title}
							</Body>
							<Body color="secondary">{copy}</Body>
						</div>
						<RewardsContainer>
							<FlexDivRow justifyContent="flex-start" columnGap="25px">
								{labels.map(({ label, value, labelIcon, valueIcon }) => (
									<FlexDivCol rowGap="5px">
										<IconContainer color="secondary">
											{label}
											{labelIcon}
										</IconContainer>
										<IconContainer size="large" color="preview">
											{value}
											{valueIcon}
										</IconContainer>
									</FlexDivCol>
								))}
							</FlexDivRow>
							<FlexDivRow justifyContent="flex-start" columnGap="25px">
								{info.map(({ label, labelIcon, value, valueIcon }) => (
									<FlexDivCol rowGap="5px">
										<IconContainer color="secondary">
											{label}
											{labelIcon}
										</IconContainer>
										<IconContainer size="large" color="primary">
											{value}
											{valueIcon}
										</IconContainer>
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
						loading={isClaimingAllRewards}
						disabled={claimDisabledAll}
						onClick={handleClaimAll}
					>
						{t('dashboard.rewards.claim-all')}
					</Button>
				</ButtonContainer>
			</CardsContainer>
		</RewardsTabContainer>
	)
}

const CustomStyledTooltip = styled(Tooltip)`
	padding: 10px;
	white-space: normal;
	left: -80px;
	${media.lessThan('md')`
		width: 200px;
		left: -150px;
	`}
`

const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`

const selectlabel = css`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.text.secondary};
	font-family: ${(props) => props.theme.fonts.bold};
`

const IconContainer = styled(Body)`
	display: flex;
	flex-direction: row;
	column-gap: 5px;
	align-items: center;
`

const SelectLabelContainer = styled(LabelContainer)`
	${selectlabel}
	padding: 6px 12px;
	height: 32px;
`

const StakingSelect = styled(Select)`
	height: 32px;

	.react-select__control {
		border-radius: 50px;
		border-width: 0px;
		width: 110px;
	}
	.react-select__menu,
	.react-select__menu-list {
		border-radius: 20px;
		background: ${(props) => props.theme.colors.selectedTheme.newTheme.button.default.background};
		border-width: 0px;
	}

	.react-select__value-container {
		padding: 0;
	}

	.react-select__single-value > div > div {
		${selectlabel}
	}

	.react-select__dropdown-indicator {
		margin-right: 10px;
	}
`

const ButtonContainer = styled.div`
	margin-bottom: 25px;
	margin-left: 25px;
	width: 100%;
	display: flex;
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
	justify-content: space-between;
	width: 100%;
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

export default RewardsTab
