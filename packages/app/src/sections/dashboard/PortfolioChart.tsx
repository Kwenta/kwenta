import { ZERO_WEI } from '@kwenta/sdk/constants'
import { Period } from '@kwenta/sdk/constants'
import { formatDollars, formatPercent } from '@kwenta/sdk/utils'
import { formatChartDate, formatChartTime, formatShortDateWithTime } from '@kwenta/sdk/utils'
import Link from 'next/link'
import { FC, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import styled, { useTheme } from 'styled-components'

import Logo from 'assets/svg/brand/logo-only.svg'
import Button from 'components/Button'
import Currency from 'components/Currency'
import { GridDivCenteredRow } from 'components/layout/grid'
import { MobileHiddenView, MobileOnlyView } from 'components/Media'
import { Body, NumericValue, Heading } from 'components/Text'
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults'
import ROUTES from 'constants/routes'
import { selectFuturesType } from 'state/futures/common/selectors'
import {
	selectFuturesPortfolio,
	selectPortfolioChartData,
	selectSelectedPortfolioTimeframe,
	selectTotalUnrealizedPnl,
} from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

import { Timeframe } from './Timeframe'

type PriceChartProps = {
	setHoverValue: (data: number | null) => void
	setHoverTitle: (data: string | null) => void
}

const ChartCTA = () => {
	const { t } = useTranslation()
	return (
		<CTAContainer>
			<Logo />
			<Heading variant="h3">{t('dashboard.overview.portfolio-chart.welcome')}</Heading>
			<Body color={'secondary'}>{t('dashboard.overview.portfolio-chart.hero')}</Body>
			<Link href={ROUTES.Markets.Home(DEFAULT_FUTURES_MARGIN_TYPE)}>
				<Button variant="flat" size="medium">
					{t('homepage.nav.trade-now')}
				</Button>
			</Link>
		</CTAContainer>
	)
}

const PriceChart: FC<PriceChartProps> = ({ setHoverValue, setHoverTitle }) => {
	const theme = useTheme()
	const portfolioTimeframe = useAppSelector(selectSelectedPortfolioTimeframe)
	const accountType = useAppSelector(selectFuturesType)
	const portfolioChartData = useAppSelector(selectPortfolioChartData)

	const portfolioData = useMemo(
		() => portfolioChartData[accountType],
		[portfolioChartData, accountType]
	)

	const lineColor = useMemo(() => {
		const isNegative =
			portfolioData.length > 2
				? portfolioData[portfolioData.length - 1].total - portfolioData[0].total < 0
				: false
		return theme.colors.selectedTheme[isNegative ? 'red' : 'green']
	}, [portfolioData, theme])

	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart
				data={portfolioData}
				margin={{ top: 12, bottom: 0, left: 8, right: 0 }}
				onMouseLeave={() => {
					setHoverValue(null)
					setHoverTitle(null)
				}}
				onMouseMove={(payload) => {
					if (payload.activePayload && payload.activePayload.length > 0) {
						const newTotal = payload.activePayload[0].payload?.total

						const formattedDate = formatShortDateWithTime(
							payload.activePayload[0].payload?.timestamp
						)
						if (newTotal) {
							setHoverValue(newTotal)
							setHoverTitle(formattedDate)
						} else {
							setHoverValue(null)
							setHoverTitle(null)
						}
					} else {
						setHoverValue(null)
						setHoverTitle(null)
					}
				}}
			>
				<XAxis
					dataKey="timestamp"
					type="number"
					scale="time"
					minTickGap={75}
					tickFormatter={portfolioTimeframe === Period.ONE_WEEK ? formatChartTime : formatChartDate}
					domain={['dataMin', 'dataMax']}
				/>
				<Tooltip content={<></>} />
				<Legend
					verticalAlign="top"
					align="left"
					formatter={(value) =>
						value === 'total'
							? accountType === 'cross_margin'
								? 'Cross Margin'
								: 'Smart Margin'
							: value
					}
				/>
				<Line
					type="monotone"
					dataKey="total"
					stroke={lineColor}
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	)
}

const PortfolioChart: FC = () => {
	const { t } = useTranslation()
	const { crossMargin: crossTotal, smartMargin: smartTotal } =
		useAppSelector(selectFuturesPortfolio)
	const accountType = useAppSelector(selectFuturesType)
	const { cross_margin: crossPortfolioData, smart_margin: smartPortfolioData } =
		useAppSelector(selectPortfolioChartData)

	const upnl = useAppSelector(selectTotalUnrealizedPnl)

	const [hoverValue, setHoverValue] = useState<number | null>(null)
	const [hoverTitle, setHoverTitle] = useState<string | null>(null)

	const total = useMemo(
		() => (accountType === 'cross_margin' ? crossTotal : smartTotal),
		[accountType, crossTotal, smartTotal]
	)

	const portfolioData = useMemo(() => {
		return accountType === 'cross_margin' ? crossPortfolioData : smartPortfolioData
	}, [accountType, crossPortfolioData, smartPortfolioData])

	const changeValue = useMemo(() => {
		if (portfolioData.length < 2) {
			return {
				value: null,
				text: '',
			}
		} else {
			const value =
				(hoverValue ?? portfolioData[portfolioData.length - 1].total) - portfolioData[0].total
			const changeValue = portfolioData[0].total > 0 ? value / portfolioData[0].total : 0
			const text = `${value >= 0 ? '+' : ''}${formatDollars(value, {
				suggestDecimals: true,
			})} (${formatPercent(changeValue)})`
			return {
				value,
				text,
			}
		}
	}, [portfolioData, hoverValue])

	return (
		<>
			<MobileHiddenView>
				<ChartGrid>
					<ChartOverlay>
						<PortfolioTitle>
							{hoverTitle ? hoverTitle : t('dashboard.overview.portfolio-chart.portfolio-value')}
						</PortfolioTitle>
						<NumericValue fontSize={20} value={hoverValue || total}>
							{formatDollars(hoverValue || total, { maxDecimals: 2 })}
						</NumericValue>
						<NumericValue colored value={changeValue.value ?? ZERO_WEI}>
							{changeValue.text}&nbsp;
						</NumericValue>
					</ChartOverlay>
					<GridBox>
						<PortfolioTitle>{t('dashboard.overview.portfolio-chart.upnl')}</PortfolioTitle>
						<NumericValue colored value={upnl ?? ZERO_WEI}>
							{upnl.gt(ZERO_WEI) ? '+' : ''}
							{formatDollars(upnl, { suggestDecimals: true })}
						</NumericValue>
					</GridBox>
					{!!total && portfolioData.length >= 2 ? (
						<ChartContainer>
							<TopBar>
								<TimeframeOverlay>
									<Timeframe />
								</TimeframeOverlay>
							</TopBar>
							<PriceChart setHoverValue={setHoverValue} setHoverTitle={setHoverTitle} />
						</ChartContainer>
					) : (
						<ChartContainer>
							<ChartCTA />
						</ChartContainer>
					)}
				</ChartGrid>
			</MobileHiddenView>
			<MobileOnlyView>
				{!!total && portfolioData.length >= 2 ? (
					<MobileChartGrid>
						<ChartOverlay>
							<PortfolioTitle>Portfolio Value</PortfolioTitle>
							<PortfolioText currencyKey="sUSD" price={hoverValue || total} sign="$" />
							<NumericValue colored value={changeValue.value ?? ZERO_WEI}>
								{changeValue.text}&nbsp;
							</NumericValue>
						</ChartOverlay>
						<ChartContainer>
							<TopBar>
								<TimeframeOverlay>
									<Timeframe />
								</TimeframeOverlay>
							</TopBar>
							<PriceChart setHoverValue={setHoverValue} setHoverTitle={setHoverTitle} />
						</ChartContainer>
					</MobileChartGrid>
				) : (
					<ChartContainer mobile>
						<ChartCTA />
					</ChartContainer>
				)}
			</MobileOnlyView>
		</>
	)
}

const ChartContainer = styled.div<{ mobile?: boolean }>`
	position: relative;
	grid-row-end: span 3;
	border-left: ${(props) => (props.mobile ? null : props.theme.colors.selectedTheme.border)};
	border-top: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : null)};
	border-bottom: ${(props) => (props.mobile ? props.theme.colors.selectedTheme.border : null)};
	padding: 0 8px 0 8px;
`

const TopBar = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	z-index: 3;
	display: flex;
	flex-direction: row;
	justify-content: end;
	align-items: center;
	padding: 8px 8px 0 0;
`

const ChartOverlay = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: start;
	gap: 8px;
	padding: 16px;
`

const GridBox = styled.div`
	display: flex;
	flex-direction: column;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 16px;
`

const TimeframeOverlay = styled.div`
	max-width: 192px;
`

const PortfolioTitle = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	font-size: 16px;
	margin-bottom: 4px;
`

const PortfolioText = styled(Currency.Price)`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-family: ${(props) => props.theme.fonts.monoBold};
	letter-spacing: -1.2px;
	font-size: 20px;

	span {
		line-height: 23px;
	}
`

const MobileChartGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 5fr;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 0px;
	height: 360px;
`

const ChartGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr 3fr;
	grid-template-rows: 1fr 1fr;
	grid-auto-flow: column;
	width: 100%;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	height: 260px;
	margin-top: 15px;
`

const CTAContainer = styled(GridDivCenteredRow)`
	height: 100%;
	text-align: center;
	justify-content: center;
	justify-items: center;
	grid-gap: 10px;
	padding: 50px 40px;
	margin-top: -2px;
`

export default PortfolioChart
