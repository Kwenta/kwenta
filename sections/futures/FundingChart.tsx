import { useEffect } from 'react';
import { LineChart, XAxis, Legend, Line, ResponsiveContainer } from 'recharts';
import styled, { useTheme } from 'styled-components';

import { fetchFundingRates } from 'state/futures/actions';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatChartTime } from 'utils/formatters/date';

const FundingChart = () => {
	const theme = useTheme();
	const dispatch = useAppDispatch();
	const marketInfo = useAppSelector(selectMarketInfo);
	const marketFundingRates = useAppSelector(({ futures }) => futures.marketFundingRates);

	useEffect(() => {
		if (marketInfo?.asset) {
			dispatch(fetchFundingRates(marketInfo.asset));
		}
	}, [dispatch, marketInfo?.asset]);

	return (
		<ResponsiveContainer width="100%" height="100%">
			<LineChart data={marketFundingRates}>
				<XAxis
					dataKey="fundingRate"
					type="number"
					scale="time"
					tickFormatter={formatChartTime}
					minTickGap={75}
					domain={['dataMin', 'dataMax']}
				/>
				<Legend verticalAlign="top" align="left" />
				<Line
					type="monotone"
					dataKey="fundingRate"
					stroke={theme.colors.selectedTheme.green}
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

const Container = styled.div`
	height: 100%;
	overflow: hidden;
`;

export default FundingChart;
