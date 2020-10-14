import { useTranslation, Trans } from 'react-i18next';
import { useContext, FC, useState, useMemo } from 'react';
import { AreaChart, XAxis, YAxis, Area, Tooltip } from 'recharts';
import isNumber from 'lodash/isNumber';
import get from 'lodash/get';
import styled, { css, ThemeContext } from 'styled-components';
import format from 'date-fns/format';

import SnowflakeIcon from 'assets/inline-svg/app/snowflake.svg';
import LoaderIcon from 'assets/inline-svg/app/loader.svg';

import { Synth } from 'lib/synthetix';

import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';

import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import { PeriodLabel, PERIOD_LABELS_MAP, PERIOD_LABELS, PERIOD_IN_HOURS } from 'constants/period';

import ChangePercent from 'components/ChangePercent';

import {
	GridDivCenteredCol,
	GridDivCenteredRow,
	TextButton,
	FlexDivRowCentered,
	NoTextTransform,
	AbsoluteCenteredDiv,
} from 'styles/common';

import { formatCurrency } from 'utils/formatters/number';

import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';
import media from 'styles/media';

import { Side } from '../types';

type ChartCardProps = {
	side: Side;
	currencyKey: CurrencyKey | null;
	priceRate: number | null;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
	isSynthFrozen: boolean;
	className?: string;
};

const ChartCard: FC<ChartCardProps> = ({
	side,
	currencyKey,
	priceRate,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
	isSynthFrozen,
	...rest
}) => {
	const { t } = useTranslation();
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodLabel>(PERIOD_LABELS_MAP.ONE_DAY);
	const theme = useContext(ThemeContext);
	const [currentPrice, setCurrentPrice] = useState<number | null>(null);

	const historicalRates = useHistoricalRatesQuery(currencyKey, selectedPeriod.period);

	const isSUSD = currencyKey === SYNTHS_MAP.sUSD;

	const change = historicalRates.data?.change ?? null;
	const rates = historicalRates.data?.rates ?? [];

	const isChangePositive = change != null && change >= 0;
	const chartColor = isChangePositive || isSUSD ? theme.colors.green : theme.colors.red;

	const price = currentPrice || priceRate;

	const showOverlayMessage = isSynthFrozen;
	const showLoader = historicalRates.isLoading;
	const disabledInteraction = showLoader || showOverlayMessage;
	const noData =
		historicalRates.isSuccess && historicalRates.data && historicalRates.data.rates.length === 0;

	let linearGradientId = `priceChartCardArea-${side}`;

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

	const CustomTooltip = ({
		active,
		label,
		payload,
	}: {
		active: boolean;
		payload: [
			{
				value: number;
			}
		];
		label: Date;
	}) =>
		active && payload && payload[0] ? (
			<TooltipContentStyle>
				<LabelStyle>{format(label, 'do MMM yy | HH:mm')}</LabelStyle>
				<LabelStyle>
					{t('exchange.price-chart-card.tooltip.price')}{' '}
					<CurrencyPrice>
						{formatCurrency(selectedPriceCurrency.name, payload[0].value, {
							sign: selectedPriceCurrency.sign,
						})}
					</CurrencyPrice>
				</LabelStyle>
			</TooltipContentStyle>
		) : null;

	return (
		<Container {...rest}>
			<ChartHeader>
				<FlexDivRowCentered>
					{currencyKey != null ? (
						<>
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
									})}
								</CurrencyPrice>
							)}
							{change != null && <ChangePercent value={change} />}
						</>
					) : (
						<CurrencyLabel>{t('common.price')}</CurrencyLabel>
					)}
				</FlexDivRowCentered>
				{!isSynthFrozen && (
					<Actions>
						{PERIOD_LABELS.map((period) => (
							<StyledTextButton
								key={period.value}
								isActive={period.value === selectedPeriod.value}
								onClick={() => setSelectedPeriod(period)}
							>
								{t(period.i18nLabel)}
							</StyledTextButton>
						))}
					</Actions>
				)}
			</ChartHeader>
			<ChartBody>
				<ChartData disabledInteraction={disabledInteraction}>
					<RechartsResponsiveContainer
						width="100%"
						height="100%"
						id={`rechartsResponsiveContainer-${side}-${currencyKey}`}
					>
						<AreaChart
							data={disabledInteraction ? [] : computedRates}
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
									<stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
									<stop offset="100%" stopColor={chartColor} stopOpacity={0} />
								</linearGradient>
							</defs>
							<XAxis
								// @ts-ignore
								dx={-5}
								dy={10}
								minTickGap={20}
								dataKey="timestamp"
								allowDataOverflow={true}
								tick={fontStyle}
								axisLine={false}
								tickLine={false}
								tickFormatter={(val) => {
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
								hide={true}
								allowDataOverflow={true}
								domain={isSUSD ? ['dataMax', 'dataMax'] : ['auto', 'auto']}
								tick={fontStyle}
								orientation="right"
								axisLine={false}
								tickLine={false}
								tickFormatter={(val) =>
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
										<CustomTooltip />
									}
								/>
							)}
						</AreaChart>
					</RechartsResponsiveContainer>
				</ChartData>
				<AbsoluteCenteredDiv>
					{showOverlayMessage ? (
						<>
							{isSynthFrozen && (
								<OverlayMessage>
									<SnowflakeIcon />
									<OverlayMessageTitle>
										{t('exchange.price-chart-card.overlay-messages.frozen-synth.title')}
									</OverlayMessageTitle>
									<OverlayMessageSubtitle>
										{t('exchange.price-chart-card.overlay-messages.frozen-synth.subtitle')}
									</OverlayMessageSubtitle>
								</OverlayMessage>
							)}
						</>
					) : showLoader ? (
						<LoaderIcon />
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

const ChartData = styled.div<{ disabledInteraction: boolean }>`
	width: 100%;
	height: 100%;
	position: relative;
	${(props) =>
		props.disabledInteraction &&
		css`
			pointer-events: none;
			opacity: 0;
		`};
`;

const ChartHeader = styled(FlexDivRowCentered)`
	border-bottom: 1px solid #171a1d;
	padding-bottom: 5px;
`;

const CurrencyLabel = styled.span`
	padding-right: 20px;
	font-size: 14px;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.bold};
`;

const CurrencyPrice = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
	color: ${(props) => props.theme.colors.white};
	padding-right: 20px;
`;

const Actions = styled(GridDivCenteredCol)`
	grid-gap: 8px;
	${media.lessThan('sm')`
		overflow: auto;
		width: 70px;
	`}
`;

const ChartBody = styled.div`
	padding-top: 10px;
	height: 35vh;
`;

const StyledTextButton = styled(TextButton)<{ isActive: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.blueberry)};
	border-bottom: 2px solid
		${(props) => (props.isActive ? props.theme.colors.goldColors.color1 : 'transparent')};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
`;

const TooltipContentStyle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	padding: 5px;
	border-radius: 4px;
	background-color: ${(props) => props.theme.colors.elderberry};
	text-align: left;
`;

const ItemStyle = styled.div`
	color: ${(props) => props.theme.colors.white};
	padding: 3px 5px;
`;

const LabelStyle = styled(ItemStyle)`
	text-transform: capitalize;
`;

const OverlayMessage = styled(GridDivCenteredRow)`
	justify-items: center;
`;

const OverlayMessageTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
	padding-top: 10px;
	padding-bottom: 5px;
`;

const OverlayMessageSubtitle = styled.div`
	color: ${(props) => props.theme.colors.silver};
`;

const NoData = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
`;

export default ChartCard;
