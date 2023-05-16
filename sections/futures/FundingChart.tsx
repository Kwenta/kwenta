import { useEffect } from 'react';
import { LineChart, XAxis, Legend, Line } from 'recharts';
import styled from 'styled-components';

import { fetchFundingRates } from 'state/futures/actions';
import { useAppDispatch } from 'state/hooks';

const FundingChart = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchFundingRates());
	}, [dispatch]);

	return (
		<Container>
			<LineChart>
				<XAxis
					dataKey="funding"
					type="number"
					scale="time"
					minTickGap={75}
					domain={['dataMin', 'dataMax']}
				/>
				<Legend verticalAlign="top" align="left" />
				<Line type="monotone" dataKey="total" stroke="" dot={false} isAnimationActive={false} />
			</LineChart>
		</Container>
	);
};

const Container = styled.div`
	height: 100%;
	overflow: hidden;
`;

export default FundingChart;
