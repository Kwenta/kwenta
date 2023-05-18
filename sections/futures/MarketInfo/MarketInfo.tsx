import React from 'react';
import styled from 'styled-components';

import { useAppSelector } from 'state/hooks';
import media from 'styles/media';

import FundingChart from '../FundingChart';
import PositionChart from '../PositionChart';
import UserInfo from '../UserInfo';

const MarketInfo: React.FC = React.memo(() => {
	const selectedChart = useAppSelector(({ futures }) => futures.selectedChart);

	return (
		<Container>
			{selectedChart === 'price' ? <PositionChart /> : <FundingChart />}
			<UserInfo />
		</Container>
	);
});

const Container = styled.div`
	height: 100%;
	width: 100%;
	overflow: hidden;
	display: grid;
	grid-template-rows: 1fr 320px;
	${media.lessThan('xl')`
		grid-template-rows: 1fr 240px;
	`}
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
`;

export default MarketInfo;
