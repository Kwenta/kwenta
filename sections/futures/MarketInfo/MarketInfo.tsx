import React from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import MarketDetails from '../MarketDetails';
import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles';
import UserInfo from '../UserInfo';
import ChartWrapper from './ChartWrapper';

const MarketInfo: React.FC = React.memo(() => (
	<Container>
		<MarketDetails />
		<ChartWrapper />
		<UserInfo />
	</Container>
));

const Container = styled.div<{ showBanner?: boolean }>`
	height: 100%;
	width: 100%;
	overflow: hidden;
	display: grid;
	grid-template-rows: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px 1fr 300px;
	${media.lessThan('xl')`
		grid-template-rows: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px 1fr 250px;
	`}
`;

export default MarketInfo;
