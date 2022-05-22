import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import StatsSvg from 'assets/svg/futures/stats.svg';

import { FlexDiv, FlexDivColCentered, SmallGoldenHeader, WhiteHeader } from 'styles/common';

import media, { Media } from 'styles/media';
import SmoothScroll from 'sections/homepage/containers/SmoothScroll';
import { GridContainer } from '../common';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useGetFuturesTradingVolumeForAllMarkets from 'queries/futures/useGetFuturesTradingVolumeForAllMarkets';
import { FuturesMarket, FuturesVolumes } from 'queries/futures/types';
import Connector from 'containers/Connector';
import { getSynthDescription } from 'utils/futures';
import { Price } from 'queries/rates/types';
import ChangePercent from 'components/ChangePercent';
import Currency from 'components/Currency';
import { CurrencyKey, Synths } from 'constants/currency';
import TabButton from 'components/Button/TabButton';
import { TabPanel } from 'components/Tab';
import { values } from 'lodash';
import { Query, useQueryClient } from 'react-query';
import useGetSynthsTradingVolumeForAllMarkets from 'queries/synths/useGetSynthsTradingVolumeForAllMarkets';
import { Synth } from '@synthetixio/contracts-interface';
import _ from 'lodash';
import { SynthsVolumes } from 'queries/synths/type';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

enum MarketsTab {
	FUTURES = 'futures',
	SPOT = 'spot',
}

const Assets = () => {
	const { t } = useTranslation();
	const { whyKwentaRef } = SmoothScroll.useContainer();
	const { synthsMap } = Connector.useContainer();
	const [activeMarketsTab, setActiveMarketsTab] = useState<MarketsTab>(MarketsTab.FUTURES);

	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;

	const futuresMarketsQuery = useGetFuturesMarkets();
	const futuresMarkets = futuresMarketsQuery?.data ?? [];
	const synthList = futuresMarkets.map(({ asset }) => asset);
	const dailyPriceChangesQuery = useLaggedDailyPrice(synthList);

	const futuresVolumeQuery = useGetFuturesTradingVolumeForAllMarkets();

	const MARKETS_TABS = useMemo(
		() => [
			{
				name: MarketsTab.FUTURES,
				label: t('dashboard.overview.markets-tabs.futures').replace('Markets', ''),
				active: activeMarketsTab === MarketsTab.FUTURES,
				onClick: () => {
					setActiveMarketsTab(MarketsTab.FUTURES);
				},
			},
			{
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

	const PERPS = useMemo(() => {
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const futuresVolume: FuturesVolumes = futuresVolumeQuery?.data ?? ({} as FuturesVolumes);

		return futuresMarkets.map((market: FuturesMarket, i: number) => {
			const description = getSynthDescription(market.asset, synthsMap, t);
			const volume = futuresVolume[market.assetHex];
			const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === market.asset);

			return {
				asset: market.asset,
				description: description.split(' ')[0],
				price: market.price.toNumber(),
				volume: volume?.toNumber() || 0,
				priceChange: (market.price.toNumber() - pastPrice?.price) / market.price.toNumber() || 0,
				image: <StatsSvg />,
				icon: (
					<StyledCurrencyIcon currencyKey={(market.asset[0] !== 's' ? 's' : '') + market.asset} />
				),
			};
		});
		// eslint-disable-next-line
	}, [synthsMap, dailyPriceChangesQuery?.data, futuresVolumeQuery?.data, t]);

	const synths = useMemo(() => values(synthsMap) || [], [synthsMap]);

	const queryCache = useQueryClient().getQueryCache();
	// KM-NOTE: come back and delete
	const frozenSynthsQuery = queryCache.find(['synths', 'frozenSynths', 10]);

	const unfrozenSynths =
		frozenSynthsQuery && (frozenSynthsQuery as Query).state.status === 'success'
			? synths.filter(
					(synth) => !(frozenSynthsQuery.state.data as Set<CurrencyKey>).has(synth.name)
			  )
			: synths;

	const synthNames: string[] = synths.map((synth): string => synth.name);
	const spotDailyPriceChangesQuery = useLaggedDailyPrice(synthNames);

	const yesterday = Math.floor(new Date().setDate(new Date().getDate() - 1) / 1000);
	const synthVolumesQuery = useGetSynthsTradingVolumeForAllMarkets(yesterday);

	const SPOTS = useMemo(() => {
		return unfrozenSynths.map((synth: Synth) => {
			const description = synth.description
				? t('common.currency.synthetic-currency-name', {
						currencyName: synth.description,
				  })
				: '';
			const rate = exchangeRates && exchangeRates[synth.name];
			const price = _.isNil(rate) ? 0 : rate.toNumber();
			const dailyPriceChanges = spotDailyPriceChangesQuery?.data ?? [];
			const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === synth.name);
			const synthVolumes: SynthsVolumes = synthVolumesQuery?.data ?? ({} as SynthsVolumes);

			return {
				asset: synth.asset,
				market: synth.name,
				description: description.split(' ')[1],
				price,
				change: price !== 0 ? (price - pastPrice?.price) / price || 0 : 0,
				volume: !_.isNil(synthVolumes[synth.name]) ? Number(synthVolumes[synth.name]) : 0,
				image: <StatsSvg />,
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
		<Container ref={whyKwentaRef}>
			<Media greaterThanOrEqual="lg">
				<FlexDivColCentered>
					{title}
					<TabButtonsContainer>
						{MARKETS_TABS.map(({ name, label, active, onClick }) => (
							<StyledTabButton key={name} title={label} active={active} onClick={onClick} />
						))}
					</TabButtonsContainer>
					<TabPanel name={MarketsTab.FUTURES} activeTab={activeMarketsTab}>
						<StatsCardContainer>
							{PERPS.map(({ asset, description, price, volume, priceChange, image, icon }) => (
								<StatsCard>
									<FlexDiv>
										{icon}
										<StatsNameContainer>
											<AssetName>{asset}</AssetName>
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
											CHG:{' '}
											{priceChange === 0 ? (
												<>-</>
											) : (
												<ChangePercent value={priceChange} decimals={1} className="change-pct" />
											)}
										</StatsValue>
										<StatsValue>
											VOL:{' '}
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
						</StatsCardContainer>
					</TabPanel>
					<TabPanel name={MarketsTab.SPOT} activeTab={activeMarketsTab}>
						<StatsCardContainer>
							{SPOTS.map(({ asset, market, description, price, volume, change, image, icon }) => (
								<StatsCard>
									<FlexDiv>
										{icon}
										<StatsNameContainer>
											<AssetName>{asset}</AssetName>
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
											CHG:{'    '}
											{change === 0 ? (
												<>-</>
											) : (
												<ChangePercent value={change} decimals={1} className="change-pct" />
											)}
										</StatsValue>
										<StatsValue>
											VOL:{'    '}
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
						</StatsCardContainer>
					</TabPanel>
				</FlexDivColCentered>
			</Media>
		</Container>
	);
};

const ChartContainer = styled.span`
	display: flex;
	align-items: center;
	height: 32px;
	width: 80px;
`;

const StatsValueContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 100px;
	font-size: 13px;
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
	align-self: center;
	font-size: 20px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	width: 120px;
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
const StatsCardContainer = styled(GridContainer)`
	margin-top: 40px;
	grid-template-columns: repeat(4, auto);
`;

const StatsCard = styled(GridContainer)`
	grid-template-columns: repeat(2, auto);
	width: 275px;
	height: 140px;
	background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
	box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.1),
		inset 0px 0px 20px rgba(255, 255, 255, 0.03);
	border-radius: 15px;
	padding: 20px;
`;

const Container = styled.div`
	padding-top: 80px;
	${media.lessThan('md')`
		padding-top: 40px;
	`}
	padding-bottom: 150px;
`;

const StyledCurrencyIcon = styled(Currency.Icon)`
	width: 40px;
	height: 40px;
	margin-right: 15px;
`;

const TabButtonsContainer = styled.div`
	display: flex;
	margin-top: 40px;
	margin-bottom: 35px;

	& > button {
		height: 38px;
		font-size: 13px;

		&:not(:last-of-type) {
			margin-right: 10px;
		}
	}
`;

const StyledTabButton = styled(TabButton)`
	border: none;
`;

export default Assets;
