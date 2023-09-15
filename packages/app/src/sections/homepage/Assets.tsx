import { SECONDS_PER_DAY } from '@kwenta/sdk/constants'
import { getDisplayAsset, hoursToMilliseconds, MarketKeyByAsset } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { ColorType, createChart, UTCTimestamp } from 'lightweight-charts'
import router from 'next/router'
import React, { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Slider from 'react-slick'
import styled from 'styled-components'

import GridSvg from 'assets/svg/app/grid.svg'
import Button from 'components/Button'
import ChangePercent from 'components/ChangePercent'
import Currency from 'components/Currency'
import { FlexDiv, FlexDivColCentered, FlexDivRow } from 'components/layout/flex'
import { MobileOnlyView } from 'components/Media'
import { NotMobileView } from 'components/Media'
import { TabPanel } from 'components/Tab'
import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults'
import Connector from 'containers/Connector'
import { requestCandlesticks } from 'queries/rates/useCandlesticksQuery'
import { selectMarketVolumes } from 'state/futures/selectors'
import { fetchOptimismMarkets } from 'state/home/actions'
import { selectOptimismMarkets } from 'state/home/selectors'
import { useAppSelector, usePollAction } from 'state/hooks'
import { selectPreviousDayPrices, selectPrices } from 'state/prices/selectors'
import { SmallGoldenHeader, WhiteHeader } from 'styles/common'
import media from 'styles/media'
import { getSynthDescription } from 'utils/futures'

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

type PriceChartProps = {
	asset: string
}

export const PriceChart = ({ asset }: PriceChartProps) => {
	const chartRef = useRef('0')

	useEffect(() => {
		const chart = createChart(chartRef.current, {
			width: 160,
			height: 64,
			rightPriceScale: {
				visible: false,
				scaleMargins: {
					top: 0.5,
					bottom: 0,
				},
			},
			leftPriceScale: {
				visible: false,
				scaleMargins: {
					top: 0.5,
					bottom: 0,
				},
			},
			layout: {
				background: { type: ColorType.Solid, color: '#00000000' },
			},
			timeScale: {
				visible: false,
				barSpacing: 4,
			},
			grid: {
				vertLines: {
					visible: false,
				},
				horzLines: {
					visible: false,
				},
			},
			handleScale: false,
			handleScroll: false,
			crosshair: {
				vertLine: {
					visible: false,
				},
				horzLine: {
					visible: false,
				},
			},
		})

		requestCandlesticks(
			getDisplayAsset(asset),
			Math.floor(Date.now() / 1000) - SECONDS_PER_DAY,
			undefined,
			3600
		)
			.then((bars) => {
				let positive = false
				if (bars !== undefined) {
					const first = bars[0]?.close ?? 0
					const last = bars[bars.length - 1]?.close ?? 0
					positive = last - first >= 0
				}
				const results = bars.map((b) => ({
					value: b.close,
					time: b.timestamp as UTCTimestamp,
				}))
				return { results, positive }
			})
			.then(({ results, positive }) => {
				chart
					.addAreaSeries({
						topColor: positive ? 'rgba(127, 212, 130, 1)' : 'rgba(255, 71, 71, 1)',
						bottomColor: positive ? 'rgba(127, 212, 130, 0.1)' : 'rgba(255, 71, 71, 0.1)',
						lineColor: positive ? 'rgba(127, 212, 130, 1)' : 'rgba(239, 104, 104, 1)',
						priceLineVisible: false,
						crosshairMarkerVisible: false,
						lineStyle: 0,
						lineWidth: 2,
					})
					.setData(results)
			})
		// eslint-disable-next-line
	}, [])

	return <div ref={chartRef as unknown as React.RefObject<HTMLDivElement>}></div>
}

const Assets = () => {
	const { t } = useTranslation()
	const { l2Provider } = Connector.useContainer()
	const activeMarketsTab = MarketsTab.FUTURES

	const prices = useAppSelector(selectPrices)
	const futuresMarkets = useAppSelector(selectOptimismMarkets)
	const pastRates = useAppSelector(selectPreviousDayPrices)
	const futuresVolumes = useAppSelector(selectMarketVolumes)
	usePollAction('fetchOptimismMarkets', () => fetchOptimismMarkets(l2Provider), {
		intervalTime: hoursToMilliseconds(1),
	})

	const perps = useMemo(() => {
		return futuresMarkets
			.map((market) => {
				const marketPrice =
					prices[market.asset]?.offChain ?? prices[market.asset]?.onChain ?? wei(0)
				const description = getSynthDescription(market.asset, t)
				const volume = futuresVolumes[market.marketKey]?.volume?.toNumber() ?? 0
				const pastPrice = pastRates.find(
					(price) => price.synth === market.asset || price.synth === market.asset.slice(1)
				)
				return {
					key: market.asset,
					name: market.asset[0] === 's' ? market.asset.slice(1) : market.asset,
					description: description.split(' ')[0],
					price: marketPrice.toNumber(),
					volume,
					priceChange:
						!!marketPrice && !marketPrice.eq(0) && !!pastPrice?.rate
							? marketPrice.sub(pastPrice.rate).div(marketPrice)
							: 0,
					image: <PriceChart asset={market.asset} />,
					icon: <StyledCurrencyIcon currencyKey={MarketKeyByAsset[market.asset]} />,
				}
			})
			.sort((a, b) => b.volume - a.volume)
			.slice(0, 16)
	}, [futuresMarkets, pastRates, futuresVolumes, t, prices])

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.assets.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.assets.description')}</WhiteHeader>
		</>
	)

	var settings = {
		className: 'center',
		centerMode: true,
		infinite: true,
		centerPadding: (window.innerWidth - 380) / 2 + 40 + 'px',
		speed: 0,
		slidesToShow: 1,
		slidesToScroll: 1,
		initialSlide: 1,
		focusOnSelect: true,
		nextArrow: <></>,
		prevArrow: <></>,
	}

	return (
		<Container>
			<MobileOnlyView>
				<FlexDivColCentered>{title}</FlexDivColCentered>
				<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
					<SliderContainer>
						<StyledSlider {...settings}>
							{perps.map(({ key, name, description, price, volume, priceChange, image, icon }) => (
								<StatsCardContainer key={key} className={key}>
									<StatsCard
										noOutline
										onClick={() => {
											router.push(
												`/market/?asset=${key}&accountType=${DEFAULT_FUTURES_MARGIN_TYPE}`
											)
										}}
									>
										<GridSvg className="bg" objectfit="cover" layout="fill" />
										<StatsIconContainer>
											{icon}
											<StatsNameContainer>
												<AssetName>{name}</AssetName>
												<AssetDescription>{description}</AssetDescription>
											</StatsNameContainer>
										</StatsIconContainer>
										<ChartContainer>{image}</ChartContainer>
										<AssetPrice>
											<Currency.Price price={price} />
										</AssetPrice>
										<StatsValueContainer>
											<StatsValue>
												{'CHG    '}
												{priceChange === 0 ? (
													<>-</>
												) : (
													<ChangePercent value={priceChange} decimals={1} className="change-pct" />
												)}
											</StatsValue>
											<StatsValue>
												{'VOL    '}
												{volume === 0 ? (
													<>-</>
												) : (
													<Currency.Price price={volume} formatOptions={{ truncateOver: 1e3 }} />
												)}
											</StatsValue>
										</StatsValueContainer>
									</StatsCard>
								</StatsCardContainer>
							))}
						</StyledSlider>
					</SliderContainer>
				</TabPanel>
			</MobileOnlyView>
			<NotMobileView>
				<FlexDivColCentered>
					{title}
					<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
						<StyledFlexDivRow>
							{perps.map(({ key, name, description, price, volume, priceChange, image, icon }) => (
								<StatsCardContainer key={key}>
									<StatsCard
										className={key}
										noOutline={false}
										onClick={() => {
											router.push(
												`/market/?asset=${key}&accountType=${DEFAULT_FUTURES_MARGIN_TYPE}`
											)
										}}
									>
										<GridSvg className="bg" objectfit="cover" layout="fill" />
										<StatsIconContainer>
											{icon}
											<StatsNameContainer>
												<AssetName>{name}</AssetName>
												<AssetDescription>{description}</AssetDescription>
											</StatsNameContainer>
										</StatsIconContainer>
										<ChartContainer>{image}</ChartContainer>
										<AssetPrice>
											<Currency.Price price={price} />
										</AssetPrice>
										<StatsValueContainer>
											<StatsValue>
												{'CHG    '}
												{priceChange === 0 ? (
													<>-</>
												) : (
													<ChangePercent value={priceChange} decimals={1} className="change-pct" />
												)}
											</StatsValue>
											<StatsValue>
												{'VOL    '}
												{volume === 0 ? (
													<>-</>
												) : (
													<Currency.Price price={volume} formatOptions={{ truncateOver: 1e3 }} />
												)}
											</StatsValue>
										</StatsValueContainer>
									</StatsCard>
								</StatsCardContainer>
							))}
						</StyledFlexDivRow>
					</TabPanel>
				</FlexDivColCentered>
			</NotMobileView>
		</Container>
	)
}

const SliderContainer = styled.div`
	margin: auto;
`

const StatsCardContainer = styled.div`
	display: flex !important;
	justify-content: center !important;
	align-items: center !important;
	border-radius: 10px;
	overflow: hidden;
	transition: all 0.2s ease-in-out;

	&:hover {
		transform: translateY(-5px);
	}

	${media.lessThan('sm')`
		width: 275px !important;
		height: 150px !important;
		margin: auto;
	`};
`

const StyledSlider = styled(Slider)`
	margin: auto;

	& > ul.slick-dots {
		display: flex !important;
		position: relative;
		bottom: -10px;
		width: 320px;
		margin: auto;
		padding: 0px;
	}

	& > .slick-dots li {
		display: flex;
		align-items: center;
	}

	& > .slick-dots li button {
		border-radius: 12px;
		padding: 2.5px;
		width: 0px;
		height: 0px;
		background: linear-gradient(180deg, #282727 0%, #191818 100%);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08),
			inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	}

	& > .slick-dots li button::before {
		content: '';
	}

	& > .slick-dots li.slick-active button {
		border-radius: 12px;
		padding: 4px;
		width: 0px;
		height: 0px;
		background: ${(props) => props.theme.colors.selectedTheme.white};
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0px 0px 8px rgba(255, 255, 255, 0.25), 0px 0px 15px rgba(255, 255, 255, 0.7);
	}
`

const StatsIconContainer = styled(FlexDiv)`
	justify-content: flex-start;
	padding-left: 5px;
	text-align: left;
	padding-top: 5px;
	text-transform: none;
	${media.lessThan('sm')`
		padding-left: 0;
	`};
`

const ChartContainer = styled.div`
	margin-left: -36.5px;
	margin-top: -20px;
	overflow: hidden;
`

const StatsValueContainer = styled.div`
	display: flex;
	flex-direction: column;
	font-size: 13px;
	align-self: flex-end;
	text-align: right;
	padding-left: 7.5px;

	${media.lessThan('sm')`
		padding-left: 0px;
		font-size: 12px;
	`}
`

const StatsNameContainer = styled.div`
	font-size: 18px;
	margin-left: -5px;
	margin-top: 3px;
`

const AssetName = styled.div`
	font-size: 18px;
	color: ${(props) => props.theme.colors.selectedTheme.white};
`

const AssetPrice = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	align-self: flex-end;
	font-size: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	width: 120px;
	padding-left: 5px;
	text-align: left;
`

const AssetDescription = styled.div`
	font-size: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`

const StatsValue = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	letter-spacing: -0.04em;
	white-space: pre;
`

const StyledFlexDivRow = styled(FlexDivRow)`
	margin: auto;
	margin-top: 40px;
	gap: 20px 20px;
	width: 1160px;
	flex-wrap: wrap;
	justify-content: center;

	${media.lessThan('lgUp')`
		width: 100%;
	`}

	${media.lessThan('sm')`
		flex-wrap: nowrap;
		overflow-x: hidden;
		max-width: 100vw;
	`}
`

const StatsCard = styled(Button)`
	display: grid;
	cursor: pointer;
	width: 275px;
	height: 140px;
	grid-template-columns: repeat(2, auto);
	font-family: ${(props) => props.theme.fonts.regular};
	padding: 16px 16px;
	border-radius: 10px;
	border: 1px solid rgb(57, 57, 57);
	box-shadow: none;

	&::before {
		display: none;
	}
	transition: all 0.2s ease-in-out;

	background: #1a1a1a;

	&:hover {
		background: #202020;
	}

	svg.bg {
		z-index: 10;
		margin-top: 33px;
		width: 273px;
		height: 140px;
		position: absolute;
		right: 0;
		top: 0;
	}

	${media.lessThan('sm')`
		height: 150px;
		svg.bg {
			position: absolute;
			z-index: 10;
			margin-top: 70px;
			margin-left: 0px;
			width: 275px;
			height: 79px;
		}
	`}
`

const Container = styled.div`
	margin-bottom: 200px;
	${media.lessThan('sm')`
		margin-left: -30px;
		margin-right: -30px;
	`}
`

const StyledCurrencyIcon = styled(Currency.Icon).attrs({ width: 45, height: 45 })`
	width: 40px;
	height: 40px;
	margin-right: 15px;
`

export default Assets
