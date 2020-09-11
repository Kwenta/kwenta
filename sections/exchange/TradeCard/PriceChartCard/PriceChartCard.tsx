import { useTranslation, Trans } from 'react-i18next';
import { useContext, FC, useState } from 'react';
import { LineChart, XAxis, YAxis, Line, Tooltip } from 'recharts';
import isNumber from 'lodash/isNumber';
import get from 'lodash/get';
import styled, { ThemeContext } from 'styled-components';
import format from 'date-fns/format';

import { Synth } from 'lib/synthetix';

import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';

import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import { PeriodLabel, PERIOD_LABELS_MAP, PERIOD_LABELS, PERIOD_IN_HOURS } from 'constants/period';

import ChangePercent from 'components/ChangePercent';

import { GridDivCenteredCol, TextButton, FlexDivRowCentered, NoTextTransform } from 'styles/common';

import { formatCurrency } from 'utils/formatters/number';

import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';

import media from 'styles/media';

type ChartCardProps = {
	currencyKey: CurrencyKey | null;
	priceRate: number | null;
	selectedPriceCurrency: Synth;
	selectPriceCurrencyRate: number | null;
};

const ChartCard: FC<ChartCardProps> = ({
	currencyKey,
	priceRate,
	selectedPriceCurrency,
	selectPriceCurrencyRate,
}) => {
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

	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.white,
		fontFamily: theme.fonts.mono,
	};

	const { t } = useTranslation();

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
			</TooltipContentStyle>
		) : null;

	return (
		<Container>
			<ChartHeader>
				<div>
					{currencyKey != null ? (
						<>
							<CurrencyLabel>
								{
									<Trans
										i18nKey="common.currency.currency-price"
										values={{ currencyKey }}
										components={[<NoTextTransform />]}
									/>
								}
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
				</div>
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
			</ChartHeader>
			<ChartBody>
				<RechartsResponsiveContainer width="100%" height="100%">
					<LineChart
						data={rates.map((rateData) => ({
							...rateData,
							rate:
								selectPriceCurrencyRate != null
									? rateData.rate / selectPriceCurrencyRate
									: rateData.rate,
						}))}
						margin={{ right: isSUSD ? 0 : 40, bottom: 0 }}
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
						<XAxis
							// @ts-ignore
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
							type="number"
							allowDataOverflow={true}
							domain={isSUSD ? [1, 1] : ['auto', 'auto']}
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
						<Line
							dataKey="rate"
							stroke={chartColor}
							dot={false}
							strokeWidth={1.5}
							isAnimationActive={false}
						/>
						{currencyKey != null && (
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
					</LineChart>
				</RechartsResponsiveContainer>
			</ChartBody>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
	padding: 0 60px;
	${media.lessThan('extraLarge')`
		padding: 0;
	`}
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
`;

const ChartBody = styled.div`
	padding-top: 10px;
	height: 350px;
`;

const StyledTextButton = styled(TextButton)<{ isActive: boolean }>`
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.blueberry)};
	border-bottom: 2px solid
		${(props) => (props.isActive ? props.theme.colors.purple : 'transparent')};
`;

const TooltipContentStyle = styled.div`
	padding: 5px;
	border-radius: 4px;
	background-color: ${(props) => props.theme.colors.elderberry};
	text-align: center;
`;

const ItemStyle = styled.div`
	color: ${(props) => props.theme.colors.white};
	padding: 3px 5px;
`;

const LabelStyle = styled(ItemStyle)`
	text-transform: capitalize;
`;

export default ChartCard;
