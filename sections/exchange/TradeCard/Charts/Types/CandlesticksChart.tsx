// Vendor
import { FC, useContext, useState } from 'react';
import { BarChart, XAxis, YAxis, Bar, Cell, Tooltip } from 'recharts';
import { Synth } from '@synthetixio/contracts-interface';
import { ThemeContext } from 'styled-components';
import { formatEther } from '@ethersproject/units';
import isNull from 'lodash/isNull';

// Internal
import CandlesticksTooltip from '../common/CandlesticksTooltip';
import CustomizedXAxisTick from '../common/CustomizedXAxisTick';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';
import { Candle } from 'queries/rates/types';
import { PeriodLabel } from 'constants/period';
import { formatCurrency } from 'utils/formatters/number';

type CandlesticksChartProps = {
	data: Candle[];
	noData: Boolean;
	selectedChartPeriodLabel: PeriodLabel;
	selectedPriceCurrency: Synth;
	tooltipPriceFormatter: (n: number) => string;
};

const CandlesticksChart: FC<CandlesticksChartProps> = ({
	data,
	noData,
	selectedChartPeriodLabel,
	selectedPriceCurrency,
	tooltipPriceFormatter,
}) => {
	console.log('***Candlesticks');
	const [focusCandleIndex, setFocusCandleIndex] = useState<null | number>(null);

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
			<BarChart
				barGap={-4.5}
				data={chartData}
				margin={{ right: 0, bottom: 0, left: 0, top: 0 }}
				onMouseMove={(state: { activeTooltipIndex: number; isTooltipActive: boolean }) => {
					if (state.isTooltipActive) {
						setFocusCandleIndex(state.activeTooltipIndex);
					} else {
						setFocusCandleIndex(null);
					}
				}}
			>
				<XAxis
					// @ts-ignore
					allowDataOverflow={true}
					axisLine={false}
					dataKey="timestamp"
					dx={-1}
					dy={10}
					height={60}
					hide={!chartData.length}
					interval="preserveStart"
					tick={<CustomizedXAxisTick selectedChartPeriodLabel={selectedChartPeriodLabel} />}
					tickLine={false}
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
				{!noData && (
					<Tooltip
						content={
							// @ts-ignore
							<CandlesticksTooltip formatCurrentPrice={tooltipPriceFormatter} />
						}
						// @ts-ignore - req'd props passed in by recharts
						cursor={false}
						isAnimationActive={false}
						position={{
							y: 0,
						}}
					/>
				)}
				{/*candle wick*/}
				<Bar dataKey="pv" barSize={1}>
					{chartData.map((datum: { uv: number[] }, idx: number) => {
						const isCandleGreen = datum.uv[1] - datum.uv[0] > 0;

						return (
							<Cell
								key={`cell-${idx}`}
								fill={determineFillColor(focusCandleIndex, idx, isCandleGreen)}
							/>
						);
					})}
				</Bar>
				{/*candle body*/}
				<Bar dataKey="uv" barSize={8} minPointSize={1}>
					{chartData.map((datum: { uv: number[] }, idx: number) => {
						const isCandleGreen = datum.uv[1] - datum.uv[0] > 0;

						return (
							<Cell
								key={`cell-${idx}`}
								fill={determineFillColor(focusCandleIndex, idx, isCandleGreen)}
							/>
						);
					})}
				</Bar>
			</BarChart>
		</RechartsResponsiveContainer>
	);
};

function determineFillColor(
	focusCandleIdx: number | null,
	currentCandleIdx: number,
	isCandleGreen: boolean
) {
	const regularGreen = '#6DDA78';
	const lighterGreen = '#248f2e';

	const regularRed = '#E0306B';
	const lighterRed = '#9b1743';

	// if focusCandleIndex === null, leave everything as is
	if (isNull(focusCandleIdx)) {
		return isCandleGreen ? regularGreen : regularRed;
	}

	// if focusCandleIndex === currentCandle
	if (focusCandleIdx === currentCandleIdx) {
		return isCandleGreen ? regularGreen : regularRed;
	} else {
		return isCandleGreen ? lighterGreen : lighterRed;
	}
}

export default CandlesticksChart;
