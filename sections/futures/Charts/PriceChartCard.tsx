import { useContext, FC, useState, useMemo, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AreaChart, XAxis, YAxis, Area, Tooltip } from 'recharts';
import isNumber from 'lodash/isNumber';
import get from 'lodash/get';
import styled, { ThemeContext } from 'styled-components';
import format from 'date-fns/format';
import { Svg } from 'react-optimized-image';
import useSynthetixQueries from '@synthetixio/queries';

import LoaderIcon from 'assets/svg/app/loader.svg';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';

import { CurrencyKey, Synths } from 'constants/currency';
import { PERIOD_LABELS, PERIOD_IN_HOURS, Period, PERIOD_LABELS_MAP } from 'constants/period';
import { ChartType } from 'constants/chartType';

import ChangePercent from 'components/ChangePercent';
import { FlexDivRowCentered, NoTextTransform, AbsoluteCenteredDiv } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useMarketClosed from 'hooks/useMarketClosed';
import useCandlesticksQuery from 'queries/rates/useCandlesticksQuery';
import CandlestickChart from './CandlesticksChart';
import ChartTypeToggle from './ChartTypeToggle';

import CustomTooltip from './common/CustomTooltip';
import OverlayMessageContainer from './common/OverlayMessage';
import {
	ChartData,
	CurrencyLabel,
	CurrencyPrice,
	Actions,
	ChartBody,
	StyledTextButton,
	NoData,
	OverlayMessage,
} from './common/styles';

type ChartCardProps = {
	currencyKey: CurrencyKey | null;
	priceRate: number | null;
	className?: string;
	openAfterHoursModalCallback?: () => void;
	alignRight?: boolean;
};

const ChartCard: FC<ChartCardProps> = ({
	currencyKey,
	priceRate,
	openAfterHoursModalCallback,
	alignRight,
	...rest
}) => {
	const { t } = useTranslation();
	const [selectedChartType, setSelectedChartType] = useState(ChartType.AREA);
	const [selectedPeriod, setSelectedPeriod] = useState(PERIOD_LABELS_MAP.FOUR_HOURS);
	const { selectPriceCurrencyRate, selectedPriceCurrency } = useSelectedPriceCurrency();
	const { isMarketClosed, marketClosureReason } = useMarketClosed(currencyKey);

	const theme = useContext(ThemeContext);
	const [currentPrice, setCurrentPrice] = useState<number | null>(null);

	const { useHistoricalRatesQuery } = useSynthetixQueries();
	const historicalRates = useHistoricalRatesQuery(currencyKey, selectedPeriod.period);
	const candlesticksQuery = useCandlesticksQuery(currencyKey, selectedPeriod.period);

	const isSUSD = currencyKey === Synths.sUSD;

	const change = historicalRates.data?.change ?? null;
	// eslint-disable-next-line
	const rates = historicalRates.data?.rates ?? [];
	const candlesticksData =
		candlesticksQuery.isSuccess && candlesticksQuery.data ? candlesticksQuery.data : [];

	const isChangePositive = change != null && change >= 0;
	const chartColor = isChangePositive || isSUSD ? theme.colors.green : theme.colors.red;

	const price = currentPrice || priceRate;

	const showOverlayMessage = isMarketClosed;
	const showLoader = historicalRates.isLoading || candlesticksQuery.isLoading;
	const disabledInteraction = showLoader || showOverlayMessage;
	const noCandlesticksData =
		selectedChartType === ChartType.CANDLESTICK &&
		candlesticksQuery.isSuccess &&
		candlesticksQuery.data &&
		candlesticksData.length === 0;
	const noData =
		(historicalRates.isSuccess &&
			historicalRates.data &&
			historicalRates.data.rates.length === 0) ||
		noCandlesticksData;

	// const isMobile = useMediaQuery({ query: `(max-width: ${breakpoints.sm})` });

	let linearGradientId = `priceChartCardArea`;

	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.white,
		fontFamily: theme.fonts.mono,
	};

	const computedRates = useMemo(() => {
		if (selectPriceCurrencyRate != null) {
			return rates.map((rateData) => ({
				...rateData,
				rate: rateData.rate / selectPriceCurrencyRate,
			}));
		}
		return rates;
	}, [rates, selectPriceCurrencyRate]);

	// Reset to area chart if selected period is not 1M
	useEffect(() => {
		if (selectedPeriod.period !== Period.ONE_MONTH) {
			setSelectedChartType(ChartType.AREA);
		}
	}, [selectedPeriod]);

	return (
		<Container {...rest}>
			<ChartHeader>
				<ChartHeaderTop
					{...{
						alignRight,
					}}
				>
					{currencyKey != null ? (
						<>
							<div>
								<CurrencyLabel>
									<Trans
										i18nKey="common.currency.currency-price"
										values={{ currencyKey }}
										components={[<NoTextTransform />]}
									/>
								</CurrencyLabel>
								{price != null && (
									<CurrencyPrice>
										{formatCurrency(selectedPriceCurrency.name, price, {
											sign: selectedPriceCurrency.sign,
											// @TODO: each currency key should specify how many decimals to show
											minDecimals:
												currencyKey === Synths.sKRW || currencyKey === Synths.sJPY ? 4 : 2,
										})}
									</CurrencyPrice>
								)}
								{change != null && <ChangePercent value={change} />}
							</div>

							<Actions>
								{PERIOD_LABELS.map((period) => (
									<StyledTextButton
										key={period.value}
										isActive={period.value === selectedPeriod.value}
										onClick={() => {
											setSelectedPeriod(period);
											if (period.period !== Period.ONE_MONTH) {
												setSelectedChartType(ChartType.AREA);
											}
										}}
									>
										{t(period.i18nLabel)}
									</StyledTextButton>
								))}
							</Actions>
						</>
					) : (
						<CurrencyLabel>{t('common.price')}</CurrencyLabel>
					)}
				</ChartHeaderTop>
			</ChartHeader>
			<ChartTypeToggle
				chartTypes={[ChartType.AREA, ChartType.CANDLESTICK]}
				selectedChartType={selectedChartType}
				setSelectedChartType={setSelectedChartType}
				setSelectedPeriod={setSelectedPeriod}
				alignRight={alignRight}
			/>
			<ChartBody>
				<ChartData disabledInteraction={disabledInteraction}>
					{selectedChartType === ChartType.AREA ? (
						<RechartsResponsiveContainer
							width="100%"
							height="100%"
							id={`rechartsResponsiveContainer-${currencyKey}`}
						>
							<AreaChart
								data={computedRates}
								margin={{ right: 0, bottom: 0, left: 0, top: 0 }}
								onMouseMove={(e: any) => {
									const currentRate = get(e, 'activePayload[0].payload.rate', null);
									if (currentRate) {
										setCurrentPrice(currentRate);
									} else {
										setCurrentPrice(null);
									}
								}}
								onMouseLeave={(e: any) => {
									setCurrentPrice(null);
								}}
							>
								<defs>
									<linearGradient id={linearGradientId} x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor={chartColor} stopOpacity={0.5} />
										<stop offset="100%" stopColor={chartColor} stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									// @ts-ignore
									dx={-1}
									dy={10}
									minTickGap={20}
									dataKey="timestamp"
									allowDataOverflow={true}
									tick={fontStyle}
									axisLine={false}
									tickLine={false}
									tickFormatter={(val: number) => {
										if (!isNumber(val)) {
											return '';
										}
										const periodOverOneDay =
											selectedPeriod != null && selectedPeriod.value > PERIOD_IN_HOURS.ONE_DAY;

										return format(val, periodOverOneDay ? 'dd MMM' : 'h:mma');
									}}
								/>
								<YAxis
									// TODO: might need to adjust the width to make sure we do not trim the values...
									type="number"
									allowDataOverflow={true}
									domain={isSUSD ? ['dataMax', 'dataMax'] : ['auto', 'auto']}
									tick={fontStyle}
									orientation="right"
									axisLine={false}
									tickLine={false}
									tickFormatter={(val: number) =>
										formatCurrency(selectedPriceCurrency.name, val, {
											sign: selectedPriceCurrency.sign,
										})
									}
								/>
								<Area
									dataKey="rate"
									stroke={chartColor}
									dot={false}
									strokeWidth={2}
									fill={`url(#${linearGradientId})`}
									isAnimationActive={false}
								/>
								{currencyKey != null && !noData && (
									<Tooltip
										isAnimationActive={false}
										position={{
											y: 0,
										}}
										content={
											// @ts-ignore
											<CustomTooltip
												formatCurrentPrice={(n: number) =>
													formatCurrency(selectedPriceCurrency.name, n, {
														sign: selectedPriceCurrency.sign,
													})
												}
											/>
										}
									/>
								)}
							</AreaChart>
						</RechartsResponsiveContainer>
					) : (
						<CandlestickChart
							candlesticksData={candlesticksData}
							selectedPeriod={selectedPeriod}
							selectedPriceCurrency={selectedPriceCurrency}
						/>
					)}
				</ChartData>
				<AbsoluteCenteredDiv>
					{showOverlayMessage ? (
						<OverlayMessage>
							<OverlayMessageContainer
								{...{
									marketClosureReason,
									currencyKey: currencyKey!,
									openAfterHoursModalCallback,
								}}
							/>
						</OverlayMessage>
					) : showLoader ? (
						<Svg src={LoaderIcon} />
					) : noData ? (
						<NoData>{t('exchange.price-chart-card.no-data')}</NoData>
					) : undefined}
				</AbsoluteCenteredDiv>
			</ChartBody>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	position: relative;
`;

const ChartHeader = styled.div`
	display: block;
	padding-bottom: 12px;
	position: relative;
	top: 6px;
`;

const ChartHeaderTop = styled(FlexDivRowCentered)<{ alignRight?: boolean }>`
	border-bottom: 1px solid #171a1d;
	justify-content: space-between;
	padding-bottom: 5px;
`;

export default ChartCard;
