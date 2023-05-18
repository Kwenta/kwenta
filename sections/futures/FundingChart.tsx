import { wei } from '@synthetixio/wei';
import { useEffect } from 'react';
import { LineChart, XAxis, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useTheme } from 'styled-components';

import { ETH_UNIT } from 'constants/network';
import { fetchFundingRates } from 'state/futures/actions';
import { selectMarketInfo } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatChartTime } from 'utils/formatters/date';
import { formatPercent } from 'utils/formatters/number';

const formatFundingRate = (value: number) => {
	if (value === 0) {
		return '0%';
	} else {
		return formatPercent(wei(value).div(ETH_UNIT).div(24), { minDecimals: 4 });
	}
};

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
				<YAxis dataKey="fundingRate" domain={['auto', 0]} tickFormatter={formatFundingRate} />
				<XAxis
					dataKey="timestamp"
					type="number"
					scale="time"
					tickFormatter={formatChartTime}
					minTickGap={75}
					domain={['dataMin', 'dataMax']}
				/>
				<Line
					type="monotone"
					dataKey="fundingRate"
					stroke={theme.colors.selectedTheme.text.value}
					strokeWidth={2}
					dot={false}
					isAnimationActive={false}
				/>
			</LineChart>
		</ResponsiveContainer>
	);
};

export default FundingChart;
