import { LineChart, XAxis, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import styled from 'styled-components';
import { useTheme } from 'styled-components';

import { FuturesMarketAsset } from 'sdk/types/futures';
import { fetchFundingRates } from 'state/futures/actions';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector, usePollAction } from 'state/hooks';
import { formatChartTime } from 'utils/formatters/date';

import FundingChartTooltip, { formatFundingRate } from './FundingChartTooltip';

const FundingChart = () => {
	const theme = useTheme();
	const marketInfo = useAppSelector(selectMarketInfo);
	const marketFundingRates = useAppSelector(({ futures }) => futures.marketFundingRates);

	usePollAction(
		'fetchFundingRates',
		() => fetchFundingRates(marketInfo?.asset || FuturesMarketAsset.sETH),
		{ dependencies: [marketInfo?.asset], intervalTime: 60 * 60 * 1000 }
	);

	return (
		<FundingChartContainer>
			<LineChart data={marketFundingRates}>
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

const FundingChartContainer = styled(ResponsiveContainer)`
	flex: 1;
`;

export default FundingChart;
