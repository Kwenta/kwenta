import React from 'react';
import styled from 'styled-components';

import { MainContent } from 'styles/common';

import MarketDetails from '../MarketDetails';
import PositionChart from '../PositionChart';
import UserInfo from '../UserInfo';
import MarketHead from './MarketHead';

const MarketInfo: React.FC = React.memo(() => (
	<Container>
		<MarketHead />
		<MarketDetails />
		<PositionChart />
		<UserInfo />
	</Container>
));

const Container = styled(MainContent)`
	margin: unset;
	max-width: unset;
	padding-bottom: 20px;
`;

export default MarketInfo;
