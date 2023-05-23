import { FC } from 'react';
import { LineChart, XAxis, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import styled, { css } from 'styled-components';
import { useTheme } from 'styled-components';

import { fetchFundingRates } from 'state/futures/actions';
import { selectMarketAsset } from 'state/futures/selectors';
import { useAppSelector, usePollAction } from 'state/hooks';
import { formatChartTime } from 'utils/formatters/date';

import FundingChartTooltip, { formatFundingRate } from './FundingChartTooltip';

type FundingChartProps = {
	display?: boolean;
};

const FundingChart: FC<FundingChartProps> = ({ display = true }) => {
	const theme = useTheme();
	const marketAsset = useAppSelector(selectMarketAsset);
	const marketFundingRates = useAppSelector(({ futures }) => futures.marketFundingRates);

	usePollAction('fetchFundingRates', () => fetchFundingRates(marketAsset), {
		dependencies: [marketAsset],
		intervalTime: 60 * 60 * 1000,
	});

	return (
		<FundingChartContainer $display={display}>
			<LineChart data={marketFundingRates[marketAsset]}>
				<YAxis dataKey="fundingRate" domain={['auto', 0]} tickFormatter={formatFundingRate} />
				<XAxis
					dataKey="timestamp"
					type="number"
					scale="time"
					tickFormatter={formatChartTime}
					minTickGap={75}
					domain={['dataMin', 'dataMax']}
				/>
				<Tooltip content={<FundingChartTooltip />} formatter={(x) => formatFundingRate(x as any)} />
				<Line
					type="monotone"
					dataKey="fundingRate"
					stroke={theme.colors.selectedTheme.text.value}
					strokeWidth={2}
					strokeLinecap="square"
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</FundingChartContainer>
	);
};

const FundingChartContainer = styled(ResponsiveContainer)<{ $display: boolean }>`
	flex: 1;
	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`;

export default FundingChart;
