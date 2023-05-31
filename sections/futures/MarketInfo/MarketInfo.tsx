import React from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import MarketDetails from '../MarketDetails';
import PositionChart from '../PositionChart';
import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles';
import UserInfo from '../UserInfo';

const MarketInfo: React.FC = React.memo(() => (
	<Container>
		<MarketDetails />
		<PositionChart />
		<UserInfo />
	</Container>
));

const Container = styled.div`
	height: 100%;
	width: 100%;
	overflow: hidden;
	display: grid;
	grid-template-rows: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px 1fr 320px;
	${media.lessThan('xl')`
		grid-template-rows: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px 1fr 240px;
	`}
`;

export default MarketInfo;
