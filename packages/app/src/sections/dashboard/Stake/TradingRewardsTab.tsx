import { ZERO_WEI } from '@kwenta/sdk/constants'
import { formatDollars, formatPercent, truncateNumbers } from '@kwenta/sdk/utils'
import { formatTruncatedDuration } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { BigNumber } from 'ethers'
import { formatEther } from 'ethers/lib/utils.js'
import { useCallback, useMemo, FC, memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HelpIcon from 'assets/svg/app/question-mark.svg'
import Button from 'components/Button'
import { FlexDivRow } from 'components/layout/flex'
import { SplitContainer } from 'components/layout/grid'
import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import { Body, LogoText } from 'components/Text'
import Tooltip from 'components/Tooltip/Tooltip'
import { EXTERNAL_LINKS } from 'constants/links'
import Connector from 'containers/Connector'
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
import { claimMultipleKwentaRewards } from 'state/staking/actions'
import { selectEpochPeriod, selectKwentaRewards, selectResetTime } from 'state/staking/selectors'
import media from 'styles/media'

const TradingRewardsTab: FC<TradingRewardProps> = memo(
	({ period = 0, start = 0, end = Math.floor(Date.now() / 1000) }) => {
		const { t } = useTranslation()
		const { walletAddress, network } = Connector.useContainer()
		const dispatch = useAppDispatch()

		const resetTime = useAppSelector(selectResetTime)
		const kwentaRewards = useAppSelector(selectKwentaRewards)
		const epochPeriod = useAppSelector(selectEpochPeriod)

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

		const estimatedRewardQuery = useGetFile(
			`/${network.id === 420 ? `goerli-` : ''}epoch-current.json`
		)
		const estimatedReward = useMemo(
			() => BigNumber.from(estimatedRewardQuery?.data?.claims[walletAddress!]?.amount ?? 0),
			[estimatedRewardQuery?.data?.claims, walletAddress]
		)
		const weeklyRewards = useMemo(
			() => BigNumber.from(estimatedRewardQuery?.data?.tokenTotal ?? 0),
			[estimatedRewardQuery?.data?.tokenTotal]
		)

		const claimDisabled = useMemo(() => kwentaRewards.lte(0), [kwentaRewards])

		const handleClaim = useCallback(() => {
			dispatch(claimMultipleKwentaRewards())
		}, [dispatch])

		const ratio = useMemo(() => {
			return wei(weeklyRewards).gt(0) ? wei(estimatedReward).div(wei(weeklyRewards)) : ZERO_WEI
		}, [estimatedReward, weeklyRewards])

		const showEstimatedValue = useMemo(() => wei(period).eq(epochPeriod), [epochPeriod, period])

		return (
			<SplitContainer>
				<CardGridContainer>
					<CardGrid>
						<div>
							<Title>{t('dashboard.stake.tabs.trading-rewards.claimable-rewards-all')}</Title>
							<LogoText yellow>{truncateNumbers(kwentaRewards, 4)}</LogoText>
						</div>
						<div>
							<Title>{t('dashboard.stake.tabs.trading-rewards.trading-activity-reset')}</Title>
							<Value>
								{resetTime > new Date().getTime() / 1000
									? formatTruncatedDuration(resetTime - new Date().getTime() / 1000)
									: t('dashboard.stake.tabs.trading-rewards.pending-for-rewards')}
							</Value>
						</div>
					</CardGrid>
					<FlexDivRow>
						<Button
							fullWidth
							variant="flat"
							size="small"
							onClick={handleClaim}
							disabled={claimDisabled}
						>
							{t('dashboard.stake.tabs.trading-rewards.claim')}
						</Button>
					</FlexDivRow>
				</CardGridContainer>
				<MobileHiddenView>
					<CardGridContainer>
						<CardGrid>
							<div>
								<Title>
									{t('dashboard.stake.tabs.trading-rewards.future-fee-paid', {
										EpochPeriod: period,
									})}
									<CustomStyledTooltip
										preset="bottom"
										width="260px"
										height="auto"
										content={t('dashboard.stake.tabs.trading-rewards.trading-rewards-tooltip')}
									>
										<WithCursor cursor="help">
											<SpacedHelpIcon />
										</WithCursor>
									</CustomStyledTooltip>
								</Title>
								<Value>{formatDollars(futuresFeePaid, { minDecimals: 2 })}</Value>
							</div>
							<div>
								<Title>
									{t('dashboard.stake.tabs.trading-rewards.fees-paid', { EpochPeriod: period })}
								</Title>
								<Value>{formatDollars(totalFuturesFeePaid, { minDecimals: 2 })}</Value>
							</div>
							{showEstimatedValue ? (
								<>
									<div>
										<Title>
											{t('dashboard.stake.tabs.trading-rewards.estimated-rewards')}
											<CustomStyledTooltip
												preset="bottom"
												width="260px"
												height="auto"
												content={t('dashboard.stake.tabs.trading-rewards.estimated-info')}
											>
												<WithCursor cursor="help">
													<SpacedHelpIcon />
												</WithCursor>
											</CustomStyledTooltip>
										</Title>
										<Value inline={true}>
											<LogoText yellow>{truncateNumbers(wei(estimatedReward), 4)}</LogoText>
										</Value>
									</div>
									<div>
										<Title>
											{t('dashboard.stake.tabs.trading-rewards.estimated-reward-share', {
												EpochPeriod: period,
											})}
										</Title>
										<Value>{formatPercent(ratio, { minDecimals: 2 })}</Value>
									</div>
								</>
							) : null}
						</CardGrid>
						<Button
							fullWidth
							variant="flat"
							size="small"
							onClick={() =>
								window.open(EXTERNAL_LINKS.Docs.TradingRewardsV2, '_blank', 'noopener noreferrer')
							}
						>
							{t('dashboard.stake.tabs.trading-rewards.learn-more')}
						</Button>
					</CardGridContainer>
				</MobileHiddenView>
				<MobileOnlyView>
					<CardGridContainer>
						<CardGrid>
							<div>
								<Title>
									{t('dashboard.stake.tabs.trading-rewards.future-fee-paid-mobile')}
									<CustomStyledTooltip
										width="200px"
										height="auto"
										left="-100px !important"
										content={t('dashboard.stake.tabs.trading-rewards.trading-rewards-tooltip')}
									>
										<WithCursor cursor="help">
											<SpacedHelpIcon />
										</WithCursor>
									</CustomStyledTooltip>
								</Title>
								<Value>{formatDollars(futuresFeePaid, { minDecimals: 2 })}</Value>
							</div>
							<div>
								<Title>{t('dashboard.stake.tabs.trading-rewards.fees-paid-mobile')}</Title>
								<Value>{formatDollars(totalFuturesFeePaid, { minDecimals: 2 })}</Value>
							</div>
							{showEstimatedValue ? (
								<>
									<div>
										<Title>
											{t('dashboard.stake.tabs.trading-rewards.estimated-rewards')}
											<CustomStyledTooltip
												width="260px"
												height="auto"
												content={t('dashboard.stake.tabs.trading-rewards.estimated-info')}
											>
												<WithCursor cursor="help">
													<SpacedHelpIcon />
												</WithCursor>
											</CustomStyledTooltip>
										</Title>
										<LogoText yellow>{truncateNumbers(wei(estimatedReward), 4)}</LogoText>
									</div>
									<div>
										<Title>
											{t('dashboard.stake.tabs.trading-rewards.estimated-reward-share-mobile', {
												EpochPeriod: period,
											})}
										</Title>
										<Value>{formatPercent(ratio, { minDecimals: 2 })}</Value>
									</div>
								</>
							) : null}
						</CardGrid>
						<Button
							fullWidth
							variant="flat"
							onClick={() =>
								window.open(EXTERNAL_LINKS.Docs.TradingRewardsV2, '_blank', 'noopener noreferrer')
							}
						>
							{t('dashboard.stake.tabs.trading-rewards.learn-more')}
						</Button>
					</CardGridContainer>
				</MobileOnlyView>
			</SplitContainer>
		)
	}
)

const CustomStyledTooltip = styled(Tooltip)`
	padding: 10px;
	white-space: normal;
	left: -80px;
	${media.lessThan('md')`
		width: 310px;
		left: -220px;
	`}
`

const WithCursor = styled.div<{ cursor: 'help' }>`
	cursor: ${(props) => props.cursor};
`

const CardGridContainer = styled(StakingCard)`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 240px;
`

const Value = styled(Body).attrs({ weight: 'bold', mono: true })`
	color: ${(props) => props.theme.colors.selectedTheme.yellow};
	font-size: 26px;
	line-height: initial;
`

const Title = styled(Body).attrs({ size: 'medium' })`
	color: ${(props) => props.theme.colors.selectedTheme.title};
	white-space: nowrap;
`

const CardGrid = styled.div`
	display: grid;
	grid-auto-flow: column;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr;

	& > div {
		margin-bottom: 20px;
	}

	${media.lessThan('md')`
		column-gap: 10px;
	`}
`

const SpacedHelpIcon = styled(HelpIcon)`
	margin-left: 8px;
`

export default TradingRewardsTab
