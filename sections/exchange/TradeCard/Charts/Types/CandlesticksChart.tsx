import { FC, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { formatEther } from '@ethersproject/units';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';
import { PeriodLabel, PERIOD_IN_HOURS } from 'constants/period';
import formatDate from 'date-fns/format';
import { Synth } from '@synthetixio/contracts-interface';
import { isNumber } from 'lodash';
import { Candle } from 'queries/rates/types';
import { BarChart, XAxis, YAxis, Bar, Cell } from 'recharts';
import { Tooltip } from 'styles/common';
import { formatCurrency } from 'utils/formatters/number';

type CandlesticksChartProps = {
	data: Candle[];
	selectedChartPeriodLabel: PeriodLabel;
	selectedPriceCurrency: Synth;
};

const CandlesticksChart: FC<CandlesticksChartProps> = ({
	data,
	selectedChartPeriodLabel,
	selectedPriceCurrency,
}) => {
	const theme = useContext(ThemeContext);

	const chartData = data.map((candle: any) => ({
		timestamp: Number(candle.timestamp) * 1000,
		uv: [Number(formatEther(candle.open)), Number(formatEther(candle.close))],
		pv: [Number(formatEther(candle.high)), Number(formatEther(candle.low))],
	}));

	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.white,
		fontFamily: theme.fonts.mono,
	};

	return (
		<RechartsResponsiveContainer width="100%" height="100%">
			<BarChart barGap={-4.5} data={chartData} margin={{ right: 0, bottom: 0, left: 0, top: 0 }}>
				<XAxis
					// @ts-ignore
					dx={-1}
					dy={10}
					minTickGap={20}
					dataKey="timestamp"
					allowDataOverflow={true}
					axisLine={false}
					tickLine={false}
					tick={fontStyle}
					tickFormatter={(val) => {
						if (!isNumber(val)) {
							return '';
						}
						const periodOverOneDay =
							selectedChartPeriodLabel != null &&
							selectedChartPeriodLabel.value > PERIOD_IN_HOURS.ONE_DAY;

						return formatDate(val, periodOverOneDay ? 'dd MMM' : 'h:mma');
					}}
					hide={chartData.length === 0}
				/>
				<YAxis
					type="number"
					allowDataOverflow={true}
					domain={['dataMin', 'dataMax']}
					orientation="right"
					axisLine={false}
					tickLine={false}
					tick={fontStyle}
					tickFormatter={(val) =>
						formatCurrency(selectedPriceCurrency.name, val, {
							sign: selectedPriceCurrency.sign,
						})
					}
				/>
				<Tooltip />
				<Bar dataKey="pv" barSize={1}>
					{chartData.map((datum: { uv: number[] }, index: number) => (
						<Cell
							key={`cell-${index}`}
							fill={datum.uv[1] - datum.uv[0] > 0 ? '#6DDA78' : '#E0306B'}
						/>
					))}
				</Bar>
				<Bar dataKey="uv" barSize={8} minPointSize={1}>
					{chartData.map((datum: { uv: number[] }, index: number) => (
						<Cell
							key={`cell-${index}`}
							fill={datum.uv[1] - datum.uv[0] > 0 ? '#6DDA78' : '#E0306B'}
						/>
					))}
				</Bar>
			</BarChart>
		</RechartsResponsiveContainer>
	);
};

export default CandlesticksChart;
