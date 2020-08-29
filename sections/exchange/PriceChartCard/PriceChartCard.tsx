import { useTranslation, Trans } from 'react-i18next';
import { useContext, FC, useState } from 'react';
import { CurrencyKey, USD_SIGN } from 'constants/currency';
import { LineChart, XAxis, YAxis, Line, Tooltip } from 'recharts';
import isNumber from 'lodash/isNumber';
import format from 'date-fns/format';
import styled, { ThemeContext } from 'styled-components';
import get from 'lodash/get';
import { GridDivCenteredCol, TextButton, FlexDivRowCentered, NoTextTransform } from 'styles/common';

import { PeriodLabel, PERIOD_LABELS_MAP, PERIOD_LABELS, PERIOD_IN_HOURS } from 'constants/period';

import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';

import { formatFiatCurrency, formatPercent, formatCryptoCurrency } from 'utils/formatters';

import useHistoricalRatesQuery from 'queries/rates/useHistoricalRatesQuery';

import ChangePositiveIcon from 'assets/svg/app/change-positive.svg';
import ChangeNegativeIcon from 'assets/svg/app/change-negative.svg';
import { useRecoilValue } from 'recoil';
import { synthsMapState } from 'store/synths';

type ChartCardProps = {
	currencyKey: CurrencyKey | null;
	usdRate: number | null;
};

const ChartCard: FC<ChartCardProps> = ({ currencyKey, usdRate }) => {
	const [selectedPeriod, setSelectedPeriod] = useState<PeriodLabel>(PERIOD_LABELS_MAP.ONE_DAY);
	const synthsMap = useRecoilValue(synthsMapState);
	const theme = useContext(ThemeContext);
	const [currentPrice, setCurrentPrice] = useState<number | null>(null);

	const historicalRates = useHistoricalRatesQuery(currencyKey, selectedPeriod.period);

	const change = historicalRates.data?.change ?? null;
	const rates = historicalRates.data?.rates ?? [];

	const isChangePositive = change != null && change >= 0;
	const chartColor = isChangePositive ? theme.colors.green : theme.colors.red;

	const price = currentPrice || usdRate;

	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.white,
		fontFamily: theme.fonts.mono,
	};

	const fontStyleMedium = {
		...fontStyle,
		fontFamily: theme.fonts.mono,
	};

	const { t } = useTranslation();
	// const synthSign =
	// 	currencyKey && synthsMap && synthsMap[currencyKey] && synthsMap[currencyKey].sign;

	const synthSign = '$';

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
	}) => {
		if (active && payload && payload[0]) {
			const { value } = payload[0];

			return (
				<TooltipContentStyle>
					<LabelStyle>{format(label, 'do MMM yy | HH:mm')}</LabelStyle>
				</TooltipContentStyle>
			);
		}

		return null;
	};

	return (
		<Container>
			<ChartHeader>
				<div>
					{currencyKey && (
						<CurrencyLabel>
							{
								<Trans
									i18nKey="common.currency.currency-price"
									values={{ currencyKey }}
									components={[<NoTextTransform />]}
								/>
							}
						</CurrencyLabel>
					)}
					{price != null && <CurrencyPrice>{formatFiatCurrency(price, USD_SIGN)}</CurrencyPrice>}
					{change != null && (
						<CurrencyChange isPositive={isChangePositive}>
							{isChangePositive ? <ChangePositiveIcon /> : <ChangeNegativeIcon />}
							{formatPercent(Math.abs(change))}
						</CurrencyChange>
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
						data={rates}
						margin={{ right: 20, bottom: 0 }}
						onMouseMove={(e: any) => {
							const currentRate = get(e, 'activePayload[0].payload.rate', null);
							if (currentRate) {
								setCurrentPrice(currentRate);
							} else {
								setCurrentPrice(null);
							}
						}}
					>
						<XAxis
							// @ts-ignore
							dy={10}
							dataKey="timestamp"
							allowDataOverflow={true}
							tick={fontStyleMedium}
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
							domain={['auto', 'auto']}
							tick={fontStyleMedium}
							orientation="right"
							axisLine={false}
							tickLine={false}
							tickFormatter={(val) => formatFiatCurrency(val, synthSign || undefined)}
						/>
						<Line dataKey="rate" stroke={chartColor} dot={false} strokeWidth={1.5} />
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
					</LineChart>
				</RechartsResponsiveContainer>
			</ChartBody>
		</Container>
	);
};

const Container = styled.div`
	width: 100%;
`;

const ChartHeader = styled(FlexDivRowCentered)`
	border-bottom: 1px solid #171a1d;
	padding-bottom: 5px;
`;

const CurrencyLabel = styled.span`
	padding-right: 20px;
	text-transform: capitalize;
	color: ${(props) => props.theme.colors.white};
	font-weight: 500;
`;

const CurrencyChange = styled.span<{ isPositive: boolean }>`
	color: ${(props) => (props.isPositive ? props.theme.colors.green : props.theme.colors.red)};
	font-family: ${(props) => props.theme.fonts.mono};
	svg {
		margin-right: 5px;
		width: 12px;
		height: 12px;
	}
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
	font-size: 12px;
	padding: 3px 5px;
`;

const LabelStyle = styled(ItemStyle)`
	text-transform: capitalize;
`;

export default ChartCard;
