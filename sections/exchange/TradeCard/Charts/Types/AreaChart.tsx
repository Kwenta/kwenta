import { useContext, FC } from 'react';
import { AreaChart as BaseAreaChart, XAxis, YAxis, Area, Tooltip } from 'recharts';
import { AxisDomain } from 'recharts/types/util/types';
import isNumber from 'lodash/isNumber';
import get from 'lodash/get';
import { ThemeContext } from 'styled-components';
import formatDate from 'date-fns/format';

import { PERIOD_IN_HOURS, PeriodLabel } from 'constants/period';
import RechartsResponsiveContainer from 'components/RechartsResponsiveContainer';

import CustomTooltip from '../common/CustomTooltip';

const AreaChart: FC<{
	data: {
		timestamp: number;
		value: number;
	}[];
	change: number | null;
	selectedChartPeriodLabel: PeriodLabel;
	setCurrentPrice: (price: number | null) => void;
	noData: boolean | undefined;
	yAxisDomain?: AxisDomain;
	yAxisTickFormatter: (val: number) => string;
	tooltipPriceFormatter: (n: number) => string;
	linearGradientId: string;
}> = ({
	selectedChartPeriodLabel,
	data,
	change,
	setCurrentPrice,
	noData,
	yAxisDomain = ['auto', 'auto'],
	yAxisTickFormatter,
	tooltipPriceFormatter,
	linearGradientId,
}) => {
	const theme = useContext(ThemeContext);

	const isChangePositive = change != null && change >= 0;
	const chartColor = isChangePositive ? theme.colors.green : theme.colors.red;

	const fontStyle = {
		fontSize: '12px',
		fill: theme.colors.white,
		fontFamily: theme.fonts.mono,
	};

	return (
		<RechartsResponsiveContainer width="100%" height="100%" id={`recharts-responsive-container`}>
			<BaseAreaChart
				{...{ data }}
				margin={{ right: 0, bottom: 0, left: 0, top: 0 }}
				onMouseMove={(e: any) => {
					const currentRate = get(e, 'activePayload[0].payload.value', null);
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
					tickFormatter={(val) => {
						if (!isNumber(val)) {
							return '';
						}
						const periodOverOneDay =
							selectedChartPeriodLabel != null &&
							selectedChartPeriodLabel.value > PERIOD_IN_HOURS.ONE_DAY;

						return formatDate(val, periodOverOneDay ? 'dd MMM' : 'h:mma');
					}}
				/>
				<YAxis
					// TODO: might need to adjust the width to make sure we do not trim the values...
					type="number"
					allowDataOverflow={true}
					domain={yAxisDomain}
					tick={fontStyle}
					orientation="right"
					axisLine={false}
					tickLine={false}
					tickFormatter={yAxisTickFormatter}
				/>
				<Area
					dataKey="value"
					stroke={chartColor}
					dot={false}
					strokeWidth={2}
					fill={`url(#${linearGradientId})`}
					isAnimationActive={false}
				/>
				{!noData && (
					<Tooltip
						isAnimationActive={false}
						position={{
							y: 0,
						}}
						content={
							// @ts-ignore
							<CustomTooltip formatCurrentPrice={tooltipPriceFormatter} />
						}
					/>
				)}
			</BaseAreaChart>
		</RechartsResponsiveContainer>
	);
};

export default AreaChart;
