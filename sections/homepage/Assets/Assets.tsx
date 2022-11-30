import { ColorType, createChart, UTCTimestamp } from 'lightweight-charts';
import isNil from 'lodash/isNil';
import values from 'lodash/values';
import router from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import Slider from 'react-slick';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import GridSvg from 'assets/svg/app/grid.svg';
import Button from 'components/Button';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { TabPanel } from 'components/Tab';
import { CurrencyKey } from 'constants/currency';
import Connector from 'containers/Connector';
import { Price } from 'queries/rates/types';
import { requestCandlesticks } from 'queries/rates/useCandlesticksQuery';
import useGetSynthsTradingVolumeForAllMarkets from 'queries/synths/useGetSynthsTradingVolumeForAllMarkets';
import { selectExchangeRates } from 'state/exchange/selectors';
import { selectMarketVolumes } from 'state/futures/selectors';
import { fetchOptimismMarkets } from 'state/home/actions';
import { selectOptimismMarkets } from 'state/home/selectors';
import { useAppSelector, usePollWhenReady } from 'state/hooks';
import { pastRatesState } from 'store/futures';
import {
	FlexDiv,
	FlexDivColCentered,
	FlexDivRow,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import media, { Media } from 'styles/media';
import { getSynthDescription } from 'utils/futures';

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

type PriceChartProps = {
	asset: string;
};

export const PriceChart = ({ asset }: PriceChartProps) => {
	const chartRef = useRef('0');

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
		});

		Promise.all([
			requestCandlesticks(
				asset,
				Math.floor(Date.now() / 1000) - 60 * 60 * 24,
				undefined,
				60,
				10,
				1,
				'desc',
				true
			),
			requestCandlesticks(
				asset,
				Math.floor(Date.now() / 1000) - 60 * 60 * 24,
				undefined,
				3600,
				10,
				24,
				'asc',
				true
			),
		])
			.then(([currentPrice, bars]) => {
				let postive = false;
				if (bars !== undefined) {
					const first = bars[0]?.average ?? 0;
					postive = (currentPrice[0]?.average ?? 0) - first >= 0;
				}
				const results = bars.map((b) => ({
					value: b.average,
					time: b.timestamp as UTCTimestamp,
				}));
				return { results, postive };
			})
			.then(({ results, postive }) => {
				chart
					.addAreaSeries({
						topColor: postive ? 'rgba(127, 212, 130, 1)' : 'rgba(255, 71, 71, 1)',
						bottomColor: postive ? 'rgba(127, 212, 130, 0.1)' : 'rgba(255, 71, 71, 0.1)',
						lineColor: postive ? 'rgba(127, 212, 130, 1)' : 'rgba(239, 104, 104, 1)',
						priceLineVisible: false,
						crosshairMarkerVisible: false,
						lineStyle: 0,
						lineWidth: 2,
					})
					.setData(results);
			});
		// eslint-disable-next-line
	}, []);

	return <div ref={(chartRef as unknown) as React.RefObject<HTMLDivElement>}></div>;
};

const Assets = () => {
	const { t } = useTranslation();
	const { l2SynthsMap, l2Provider } = Connector.useContainer();
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const exchangeRates = useAppSelector(selectExchangeRates);
	const futuresMarkets = useAppSelector(selectOptimismMarkets);

	const pastRates = useRecoilValue(pastRatesState);
	const futuresVolumes = useAppSelector(selectMarketVolumes);
	usePollWhenReady('fetchOptimismMarkets', () => fetchOptimismMarkets(l2Provider));

	const MARKETS_TABS = useMemo(
		() => [
			{
				key: 'futures',
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.markets-tabs.futures').replace('Markets', ''),
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.FUTURES);
				},
			},
			{
				key: 'synths',
				name: MarketsTab.SPOT,
				label: t('dashboard.overview.markets-tabs.spot').replace('Markets', ''),
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.SPOT);
				},
			},
		],
		[activeMarketsTab, t]
	);

	const synths = useMemo(() => values(l2SynthsMap) || [], [l2SynthsMap]);
	const queryCache = useQueryClient().getQueryCache();
	// KM-NOTE: come back and delete
	const frozenSynthsQuery = queryCache.find(['synths', 'frozenSynths', 10]);

	const unfrozenSynths =
		frozenSynthsQuery && frozenSynthsQuery.state.status === 'success'
			? synths.filter(
					(synth) => !(frozenSynthsQuery.state.data as Set<CurrencyKey>).has(synth.name)
			  )
			: synths;

	const yesterday = Math.floor(new Date().setDate(new Date().getDate() - 1) / 1000);
	const synthVolumesQuery = useGetSynthsTradingVolumeForAllMarkets(yesterday);

	const PERPS = useMemo(() => {
		return (
			futuresMarkets?.map((market) => {
				const description = getSynthDescription(market.asset, l2SynthsMap, t);
				const volume = futuresVolumes[market.assetHex]?.volume?.toNumber() ?? 0;
				const pastPrice = pastRates.find(
					(price: Price) => price.synth === market.asset || price.synth === market.asset.slice(1)
				);
				return {
					key: market.asset,
					name: market.asset[0] === 's' ? market.asset.slice(1) : market.asset,
					description: description.split(' ')[0],
					price: market.price.toNumber(),
					volume,
					priceChange:
						(market.price.toNumber() - (pastPrice?.price ?? 0)) / market.price.toNumber() || 0,
					image: <PriceChart asset={market.asset} />,
					icon: (
						<StyledCurrencyIcon currencyKey={(market.asset[0] !== 's' ? 's' : '') + market.asset} />
					),
				};
			}) ?? []
		);
		// eslint-disable-next-line
	}, [futuresMarkets, l2SynthsMap, pastRates, futuresVolumes, t]);

	const SPOTS = useMemo(() => {
		const synthVolumes = synthVolumesQuery?.data ?? {};

		return unfrozenSynths.map((synth) => {
			const description = synth.description
				? t('common.currency.synthetic-currency-name', {
						currencyName: synth.description,
				  })
				: '';
			const rate = exchangeRates && exchangeRates[synth.name];
			const price = isNil(rate) ? 0 : rate.toNumber();

			const pastPrice = pastRates.find((price: Price) => {
				return price.synth === synth.asset || price.synth === synth.name;
			});

			return {
				key: synth.asset,
				market: synth.name,
				description: description.slice(10),
				price,
				change: price !== 0 ? (price - (pastPrice?.price ?? 0)) / price || 0 : 0,
				volume: !isNil(synthVolumes[synth.name]) ? Number(synthVolumes[synth.name]) ?? 0 : 0,
				image: <PriceChart asset={synth.asset} />,
				icon: (
					<StyledCurrencyIcon currencyKey={(synth.asset[0] !== 's' ? 's' : '') + synth.asset} />
				),
			};
		});
	}, [synthVolumesQuery?.data, unfrozenSynths, t, exchangeRates, pastRates]);

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.assets.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.assets.description')}</WhiteHeader>
		</>
	);

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
	};

	return (
		<Container>
			<Media lessThan="sm">
				<FlexDivColCentered>{title}</FlexDivColCentered>
				<TabButtonsContainer>
					{MARKETS_TABS.map(({ name, label, active, onClick }) => (
						<MarketSwitcher key={name} className={name} isActive={active} onClick={onClick}>
							{label}
						</MarketSwitcher>
					))}
				</TabButtonsContainer>
				<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
					<SliderContainer>
						<StyledSlider {...settings}>
							{PERPS.map(({ key, name, description, price, volume, priceChange, image, icon }) => (
								<StatsCardContainer key={key} className={key}>
									<StatsCard
										noOutline
										onClick={() => {
											router.push(`/market/?asset=${key}`);
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
											<Currency.Price
												currencyKey={'sUSD'}
												price={price}
												sign={'$'}
												conversionRate={1}
											/>
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
													<Currency.Price
														currencyKey={'sUSD'}
														price={volume}
														sign={'$'}
														conversionRate={1}
														formatOptions={{ minDecimals: 0 }}
													/>
												)}
											</StatsValue>
										</StatsValueContainer>
									</StatsCard>
								</StatsCardContainer>
							))}
						</StyledSlider>
					</SliderContainer>
				</TabPanel>
				<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
					<SliderContainer>
						<StyledSlider {...settings}>
							{SPOTS.map(({ key, market, description, price, volume, change, image, icon }) => (
								<StatsCardContainer key={key} className={key}>
									<StatsCard
										noOutline
										onClick={() => {
											market !== 'sUSD'
												? router.push(`/exchange/?quote=sUSD&base=${market}`)
												: router.push(`/exchange/`);
										}}
									>
										<GridSvg className="bg" objectfit="cover" layout="fill" />
										<StatsIconContainer>
											{icon}
											<StatsNameContainer>
												<AssetName>{market}</AssetName>
												<AssetDescription>{description}</AssetDescription>
											</StatsNameContainer>
										</StatsIconContainer>
										<ChartContainer>{image}</ChartContainer>
										<AssetPrice>
											<Currency.Price
												currencyKey={'sUSD'}
												price={price}
												sign={'$'}
												conversionRate={1}
											/>
										</AssetPrice>
										<StatsValueContainer>
											<StatsValue>
												{'CHG    '}
												{change === 0 ? (
													<>-</>
												) : (
													<ChangePercent value={change} decimals={1} className="change-pct" />
												)}
											</StatsValue>
											<StatsValue>
												{'VOL    '}
												{volume === 0 ? (
													<>-</>
												) : (
													<Currency.Price
														currencyKey={'sUSD'}
														price={volume}
														sign={'$'}
														conversionRate={1}
														formatOptions={{ minDecimals: 0 }}
													/>
												)}
											</StatsValue>
										</StatsValueContainer>
									</StatsCard>
								</StatsCardContainer>
							))}
						</StyledSlider>
					</SliderContainer>
				</TabPanel>
			</Media>
			<Media greaterThanOrEqual="sm">
				<FlexDivColCentered>
					{title}
					<TabButtonsContainer>
						{MARKETS_TABS.map(({ name, label, active, onClick }) => (
							<MarketSwitcher key={name} className={name} isActive={active} onClick={onClick}>
								{label}
							</MarketSwitcher>
						))}
					</TabButtonsContainer>

					<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
						<StyledFlexDivRow>
							{PERPS.map(({ key, name, description, price, volume, priceChange, image, icon }) => (
								<StatsCardContainer key={key}>
									<StatsCard
										className={key}
										noOutline={false}
										onClick={() => {
											router.push(`/market/?asset=${key}`);
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
											<Currency.Price
												currencyKey={'sUSD'}
												price={price}
												sign={'$'}
												conversionRate={1}
											/>
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
													<Currency.Price
														currencyKey={'sUSD'}
														price={volume}
														sign={'$'}
														conversionRate={1}
														formatOptions={{ minDecimals: 0 }}
													/>
												)}
											</StatsValue>
										</StatsValueContainer>
									</StatsCard>
								</StatsCardContainer>
							))}
						</StyledFlexDivRow>
					</TabPanel>
					<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
						<StyledFlexDivRow>
							{SPOTS.map(({ key, market, description, price, volume, change, image, icon }) => (
								<StatsCardContainer key={key}>
									<StatsCard
										className={key}
										noOutline={false}
										onClick={() => {
											market !== 'sUSD'
												? router.push(`/exchange/?quote=sUSD&base=${market}`)
												: router.push(`/exchange/`);
										}}
									>
										<GridSvg className="bg" objectfit="cover" layout="fill" />
										<StatsIconContainer>
											{icon}
											<StatsNameContainer>
												<AssetName>{market}</AssetName>
												<AssetDescription>{description}</AssetDescription>
											</StatsNameContainer>
										</StatsIconContainer>
										<ChartContainer>{image}</ChartContainer>
										<AssetPrice>
											<Currency.Price
												currencyKey={'sUSD'}
												price={price}
												sign={'$'}
												conversionRate={1}
											/>
										</AssetPrice>
										<StatsValueContainer>
											<StatsValue>
												{'CHG    '}
												{change === 0 ? (
													<>-</>
												) : (
													<ChangePercent value={change} decimals={1} className="change-pct" />
												)}
											</StatsValue>
											<StatsValue>
												{'VOL    '}
												{volume === 0 ? (
													<>-</>
												) : (
													<Currency.Price
														currencyKey={'sUSD'}
														price={volume}
														sign={'$'}
														conversionRate={1}
														formatOptions={{ minDecimals: 0 }}
													/>
												)}
											</StatsValue>
										</StatsValueContainer>
									</StatsCard>
								</StatsCardContainer>
							))}
						</StyledFlexDivRow>
					</TabPanel>
				</FlexDivColCentered>
			</Media>
		</Container>
	);
};

const SliderContainer = styled.div`
	margin: auto;
`;

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
`;

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
`;

const StatsIconContainer = styled(FlexDiv)`
	justify-content: flex-start;
	padding-left: 5px;
	text-align: left;
	padding-top: 5px;
	text-transform: none;
	${media.lessThan('sm')`
		padding-left: 0;
	`};
`;

const ChartContainer = styled.div`
	margin-left: -36.5px;
	margin-top: -20px;
	overflow: hidden;
`;

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
`;

const StatsNameContainer = styled.div`
	font-size: 18px;
	margin-left: -5px;
	margin-top: 3px;
`;

const AssetName = styled.div`
	font-size: 18px;
	color: ${(props) => props.theme.colors.selectedTheme.white};
`;

const AssetPrice = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	align-self: flex-end;
	font-size: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	width: 120px;
	padding-left: 5px;
	text-align: left;
`;

const AssetDescription = styled.div`
	font-size: 11px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
`;

const StatsValue = styled.div`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	letter-spacing: -0.04em;
	white-space: pre;
`;

const StyledFlexDivRow = styled(FlexDivRow)`
	margin: auto;
	margin-top: 40px;
	gap: 20px 20px;
	width: 1160px;
	flex-wrap: wrap;
	justify-content: center;

	${media.lessThan('sm')`
		flex-wrap: nowrap;
		overflow-x: hidden;
		max-width: 100vw;
	`}
`;

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
`;

const Container = styled.div`
	margin-bottom: 200px;
	${media.lessThan('sm')`
		margin-left: -30px;
		margin-right: -30px;
	`}
`;

const StyledCurrencyIcon = styled(Currency.Icon).attrs({ width: '45px', height: '45px' })`
	width: 40px;
	height: 40px;
	margin-right: 15px;
`;

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 40px;
	margin-bottom: 35px;
	width: 150px;
	height: 28px;
	justify-content: center;
	align-items: center;
	border-radius: 134px;

	${media.lessThan('sm')`
		margin: auto;
		margin-top: 40px;
		margin-bottom: 40px;
	`}
`;

const MarketSwitcher = styled(FlexDiv)<{ isActive: boolean }>`
	cursor: pointer;
	height: 28px;
	font-size: 13px;
	width: 88px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${(props) => (props.isActive ? '100px' : '134px')};
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.white
			: props.theme.colors.common.secondaryGray};
	border: ${(props) =>
		props.isActive ? `1px solid  ${props.theme.colors.common.primaryYellow}` : null};
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 12px 15px;
	box-shadow: ${(props) =>
		props.isActive
			? '0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1), inset 0px 0px 20px rgba(255, 255, 255, 0.03)'
			: null};

	&.short {
		cursor: not-allowed;
	}
`;

export default Assets;
