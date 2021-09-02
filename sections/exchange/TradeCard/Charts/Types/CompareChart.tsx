import { FC, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import styled, { ThemeContext } from 'styled-components';
import { CurrencyKey } from 'constants/currency';
import { PeriodLabel } from 'constants/period';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import useCompareChartData from 'sections/exchange/TradeCard/Charts/hooks/useCompareChartData';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';
import { formatCurrency } from 'utils/formatters/number';
import { TooltipContentStyle as BaseTooltipContentStyle } from 'sections/exchange/TradeCard/Charts/common/styles';

import CustomizedXAxisTick from '../common/CustomizedXAxisTick';

const CompareChart: FC<{
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}> = ({ baseCurrencyKey, quoteCurrencyKey, selectedChartPeriodLabel }) => {
	const theme = useContext(ThemeContext);
	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.white,
		fontFamily: theme.fonts.mono,
	};

	const { data, noData } = useCompareChartData({
		baseCurrencyKey,
		quoteCurrencyKey,
		selectedChartPeriodLabel,
	});

	return (
		<RechartsResponsiveContainer
			width="100%"
			height="100%"
			id={`recharts-responsive-container-${baseCurrencyKey}-${quoteCurrencyKey}`}
		>
			<LineChart {...{ data }} margin={{ right: 15, bottom: 0, left: 0, top: 0 }}>
				<XAxis
					// @ts-ignore
					allowDataOverflow={true}
					axisLine={false}
					dataKey="timestamp"
					dx={-1}
					dy={10}
					hide={!data.length}
					interval="preserveStart"
					minTickGap={20}
					tick={<CustomizedXAxisTick selectedChartPeriodLabel={selectedChartPeriodLabel} />}
					tickLine={false}
				/>
				<YAxis
					// TODO: might need to adjust the width to make sure we do not trim the values...
					yAxisId="base"
					type="number"
					allowDataOverflow={true}
					tick={fontStyle}
					orientation="right"
					axisLine={false}
					tickLine={false}
					domain={['dataMin', 'dataMax']}
					hide
				/>
				<YAxis
					// TODO: might need to adjust the width to make sure we do not trim the values...
					yAxisId="quote"
					type="number"
					allowDataOverflow={true}
					tick={fontStyle}
					orientation="right"
					axisLine={false}
					tickLine={false}
					domain={['dataMin', 'dataMax']}
					hide
				/>
				<Line
					type="monotone"
					yAxisId="base"
					dataKey="baseRate"
					stroke="#395BC5"
					strokeWidth={2}
					dot={false}
				/>
				<Line
					type="monotone"
					yAxisId="quote"
					dataKey="quoteRate"
					stroke="#7AC09F"
					strokeWidth={2}
					dot={false}
				/>
				{!noData && (
					<Tooltip
						isAnimationActive={false}
						position={{
							y: 0,
						}}
						content={
							// @ts-ignore
							<CustomTooltip {...{ baseCurrencyKey, quoteCurrencyKey }} />
						}
					/>
				)}
			</LineChart>
		</RechartsResponsiveContainer>
	);
};

const CustomTooltip: FC<{
	active: boolean;
	payload: { value: number }[];
	label: Date;
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
}> = ({ active, payload, baseCurrencyKey, quoteCurrencyKey }) => {
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	if (!(active && payload && payload.length === 2)) return null;

	const [{ value: baseRate }, { value: quoteRate }] = payload;

	return (
		<TooltipContentStyle>
			<LabelStyle>{baseCurrencyKey}</LabelStyle>
			<ValueStyle>
				{formatCurrency(selectedPriceCurrency.name, baseRate, { sign: selectedPriceCurrency.sign })}
			</ValueStyle>
			<br />
			<LabelStyle>{quoteCurrencyKey}</LabelStyle>
			<ValueStyle>
				{formatCurrency(selectedPriceCurrency.name, quoteRate, {
					sign: selectedPriceCurrency.sign,
				})}
			</ValueStyle>
		</TooltipContentStyle>
	);
};

export default CompareChart;

export const TooltipContentStyle = styled(BaseTooltipContentStyle)`
	padding: 12px;
`;

const LabelStyle = styled.div``;

const ValueStyle = styled.div`
	color: white;
`;
