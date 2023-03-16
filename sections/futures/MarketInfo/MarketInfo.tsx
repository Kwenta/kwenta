import React from 'react';
import styled from 'styled-components';

import PositionChart from '../PositionChart';
import UserInfo from '../UserInfo';
import MarketHead from './MarketHead';

const MarketInfo: React.FC = React.memo(() => (
	<Container>
		<MarketHead />
		<PositionChart />
		<UserInfo />
	</Container>
));

const Container = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
`;

export default MarketInfo;
