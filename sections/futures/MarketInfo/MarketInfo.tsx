import React from 'react';
import styled from 'styled-components';

import { selectShowBanner } from 'state/app/selectors';
import { useAppSelector } from 'state/hooks';

import MarketDetails from '../MarketDetails';
import PositionChart from '../PositionChart';
import { MARKETS_DETAILS_HEIGHT_DESKTOP } from '../styles';
import UserInfo from '../UserInfo';
import ChartWrapper from './ChartWrapper';
import media from 'styles/media';

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
	grid-template-rows: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px 1fr 320px;
	${media.lessThan('xl')`
		grid-template-rows: ${MARKETS_DETAILS_HEIGHT_DESKTOP}px 1fr 240px;
	`}
`;

export default MarketInfo;
