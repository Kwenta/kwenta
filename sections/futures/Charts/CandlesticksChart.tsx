import { formatEther } from '@ethersproject/units';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';
import { PeriodLabel, PERIOD_IN_HOURS } from 'constants/period';
import { format } from 'date-fns';
import { Synth } from '@synthetixio/contracts-interface';
import { isNumber } from 'lodash';
import { Candle } from 'queries/rates/types';
import React, { FC } from 'react';
import { BarChart, XAxis, YAxis, Bar, Cell } from 'recharts';
import { Tooltip } from 'styles/common';
import theme from 'styles/theme';
import { formatCurrency } from 'utils/formatters/number';

type CandlestickChartProps = {
	candlesticksData: Candle[];
	selectedPeriod: PeriodLabel;
	selectedPriceCurrency: Synth;
};

const CandlestickChart: FC<CandlestickChartProps> = ({
	candlesticksData,
	selectedPeriod,
	selectedPriceCurrency,
}) => {
	const data = candlesticksData?.map((candle: any) => ({
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
			<BarChart barGap={-4.5} data={data} margin={{ right: 0, bottom: 0, left: 0, top: 0 }}>
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
					tickFormatter={(val: any) => {
						if (!isNumber(val)) {
							return '';
						}
						const periodOverOneDay =
							selectedPeriod != null && selectedPeriod.value > PERIOD_IN_HOURS.ONE_DAY;

						return format(val, periodOverOneDay ? 'dd MMM' : 'h:mma');
					}}
					hide={data.length === 0}
				/>
				<YAxis
					type="number"
					allowDataOverflow={true}
					domain={['dataMin', 'dataMax']}
					orientation="right"
					axisLine={false}
					tickLine={false}
					tick={fontStyle}
					tickFormatter={(val: any) =>
						formatCurrency(selectedPriceCurrency.name, val, {
							sign: selectedPriceCurrency.sign,
						})
					}
				/>
				<Tooltip />
				<Bar dataKey="pv" barSize={1}>
					{data.map((datum: { uv: number[] }, index: number) => (
						<Cell
							key={`cell-${index}`}
							fill={datum.uv[1] - datum.uv[0] > 0 ? '#6DDA78' : '#E0306B'}
						/>
					))}
				</Bar>
				<Bar dataKey="uv" barSize={8} minPointSize={1}>
					{data.map((datum: { uv: number[] }, index: number) => (
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

export default CandlestickChart;
