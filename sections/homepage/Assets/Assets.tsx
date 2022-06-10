import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import router from 'next/router';
import values from 'lodash/values';
import isNil from 'lodash/isNil';
import { ColorType, createChart, UTCTimestamp } from 'lightweight-charts';

import GridSvg from 'assets/svg/app/grid.svg';
import {
	FlexDiv,
	FlexDivColCentered,
	FlexDivRow,
	SmallGoldenHeader,
	WhiteHeader,
} from 'styles/common';
import { Media } from 'styles/media';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import useGetSynthsTradingVolumeForAllMarkets from 'queries/synths/useGetSynthsTradingVolumeForAllMarkets';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import { requestCandlesticks } from 'queries/rates/useCandlesticksQuery';
import { Price } from 'queries/rates/types';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { TabPanel } from 'components/Tab';
import Connector from 'containers/Connector';
import { getSynthDescription } from 'utils/futures';
import { CurrencyKey, Synths } from 'constants/currency';
import { GridContainer } from '../common';

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
			handleScale: {
				mouseWheel: false,
			},
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
	const { synthsMap } = Connector.useContainer();
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

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
				label: t('dashboard.overview.markets-tabs.synths').replace('Markets', ''),
				active: activeMarketsTab === MarketsTab.SPOT,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.SPOT);
				},
			},
		],
		[activeMarketsTab, t]
	);

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const synthList = futuresMarkets.map(({ asset }) => asset);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthList);
	const futuresVolumeQuery = useGetFuturesTradingVolumeForAllMarkets();

	const synths = useMemo(() => values(synthsMap) || [], [synthsMap]);
	const queryCache = useQueryClient().getQueryCache();
	// KM-NOTE: come back and delete
	const frozenSynthsQuery = queryCache.find(['synths', 'frozenSynths', 10]);

	const unfrozenSynths =
		frozenSynthsQuery && frozenSynthsQuery.state.status === 'success'
			? synths.filter(
					(synth) => !(frozenSynthsQuery.state.data as Set<CurrencyKey>).has(synth.name)
			  )
			: synths;

	const synthNames = synths.map((synth) => synth.name);
	const spotDailyPriceChangesQuery = useLaggedDailyPrice(synthNames);
	const yesterday = Math.floor(new Date().setDate(new Date().getDate() - 1) / 1000);
	const synthVolumesQuery = useGetSynthsTradingVolumeForAllMarkets(yesterday);

	const PERPS = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const futuresVolume = futuresVolumeQuery?.data ?? {};

		return futuresMarkets.map((market, i) => {
			const description = getSynthDescription(market.asset, synthsMap, t);
			const volume = futuresVolume[market.assetHex];
			const pastPrice = dailyPriceChanges.find(
				(price: Price) => price.synth === market.asset || price.synth === market.asset.slice(1)
			);
			return {
				key: market.asset,
				name: market.asset[0] === 's' ? market.asset.slice(1) : market.asset,
				description: description.split(' ')[0],
				price: market.price.toNumber(),
				volume: volume?.toNumber() || 0,
				priceChange: (market.price.toNumber() - pastPrice?.price) / market.price.toNumber() || 0,
				image: <PriceChart asset={market.asset} />,
				icon: (
					<StyledCurrencyIcon currencyKey={(market.asset[0] !== 's' ? 's' : '') + market.asset} />
				),
			};
		});
		// eslint-disable-next-line
	}, [synthsMap, dailyPriceChangesQuery?.data, futuresVolumeQuery?.data, t]);

	const SPOTS = useMemo(() => {
		const spotDailyPriceChanges = spotDailyPriceChangesQuery?.data ?? [];
		const synthVolumes = synthVolumesQuery?.data ?? {};

		return unfrozenSynths.map((synth) => {
			const description = synth.description
				? t('common.currency.synthetic-currency-name', {
						currencyName: synth.description,
				  })
				: '';
			const rate = exchangeRates && exchangeRates[synth.name];
			const price = isNil(rate) ? 0 : rate.toNumber();

			const pastPrice = spotDailyPriceChanges.find((price: Price) => {
				return price.synth === synth.asset || price.synth === synth.name;
			});

			return {
				key: synth.asset,
				market: synth.name,
				description: description.split(' ')[1],
				price,
				change: price !== 0 ? (price - pastPrice?.price) / price || 0 : 0,
				volume: !isNil(synthVolumes[synth.name]) ? Number(synthVolumes[synth.name]) ?? 0 : 0,
				image: <PriceChart asset={synth.asset} />,
				icon: (
					<StyledCurrencyIcon currencyKey={(synth.asset[0] !== 's' ? 's' : '') + synth.asset} />
				),
			};
		});
	}, [unfrozenSynths, synthVolumesQuery, spotDailyPriceChangesQuery, exchangeRates, t]);

	const title = (
		<>
			<SmallGoldenHeader>{t('homepage.assets.title')}</SmallGoldenHeader>
			<WhiteHeader>{t('homepage.assets.description')}</WhiteHeader>
		</>
	);

	return (
		<Container>
			<Media greaterThanOrEqual="lg">
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
								<StatsCard
									key={key}
									onClick={() => {
										console.log(`link`, `/market/${key}`);
										router.push(`/market/${key}`);
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
											currencyKey={Synths.sUSD}
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
													currencyKey={Synths.sUSD}
													price={volume}
													sign={'$'}
													conversionRate={1}
													formatOptions={{ minDecimals: 0 }}
												/>
											)}
										</StatsValue>
									</StatsValueContainer>
								</StatsCard>
							))}
						</StyledFlexDivRow>
					</TabPanel>
					<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
						<StyledFlexDivRow>
							{SPOTS.map(({ key, market, description, price, volume, change, image, icon }) => (
								<StatsCard
									key={key}
									onClick={() => {
										market !== 'sUSD'
											? router.push(`/exchange/${market}-sUSD`)
											: router.push(`/exchange/`);
									}}
								>
									<GridSvg className="bg" objectfit="cover" layout="fill" />
									<FlexDiv>
										{icon}
										<StatsNameContainer>
											<AssetName>{market}</AssetName>
											<AssetDescription>{description}</AssetDescription>
										</StatsNameContainer>
									</FlexDiv>
									<ChartContainer>{image}</ChartContainer>
									<AssetPrice>
										<Currency.Price
											currencyKey={Synths.sUSD}
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
													currencyKey={Synths.sUSD}
													price={volume}
													sign={'$'}
													conversionRate={1}
													formatOptions={{ minDecimals: 0 }}
												/>
											)}
										</StatsValue>
									</StatsValueContainer>
								</StatsCard>
							))}
						</StyledFlexDivRow>
					</TabPanel>
				</FlexDivColCentered>
			</Media>
		</Container>
	);
};

const StatsIconContainer = styled(FlexDiv)`
	justify-content: flex-start;
	padding-left: 5px;
`;

const ChartContainer = styled.div`
	margin-left: -65px;
	margin-top: -20px;
`;

const StatsValueContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100px;
	font-size: 13px;
	align-self: flex-end;
`;

const StatsNameContainer = styled.div`
	font-size: 18px;
	align-self: center;
`;

const AssetName = styled.div`
	font-size: 18px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
`;

const AssetPrice = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	align-self: flex-end;
	font-size: 20px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	width: 120px;
	padding-left: 5px;
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
`;

const StatsCard = styled(GridContainer)`
	cursor: pointer;
	grid-template-columns: repeat(2, auto);
	width: 275px;
	height: 140px;
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	padding: 16px 20px;

	svg.bg {
		position: absolute;
		z-index: 10;
		margin-top: 16px;
		margin-left: -20px;
		width: 275px;
		height: 140px;
	}
`;

const Container = styled.div`
	margin-bottom: 140px;
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 45px;
	height: 45px;
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
	background: #1d1d1d;
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: inset 0px -1.34783px 0px rgba(255, 255, 255, 0.08),
		inset 0px 9.43478px 10.7826px rgba(0, 0, 0, 0.25);
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
			? props.theme.colors.common.primaryWhite
			: props.theme.colors.common.secondaryGray};
	background: ${(props) =>
		props.isActive ? 'linear-gradient(180deg, #BE9562 0%, #A07141 100%)' : null};
	text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.5);
	font-family: ${(props) => props.theme.fonts.bold};
	padding: 12px 16px;
	box-shadow: ${(props) =>
		props.isActive
			? '0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1), inset 0px 0px 20px rgba(255, 255, 255, 0.03)'
			: null};
	border: ${(props) => (props.isActive ? '1px solid rgba(255, 255, 255, 0.15)' : null)};

	&.short {
		cursor: not-allowed;
	}
`;

export default Assets;
