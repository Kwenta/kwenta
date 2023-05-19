import React from 'react';
import styled from 'styled-components';

import media from 'styles/media';

import UserInfo from '../UserInfo';
import ChartWrapper from './ChartWrapper';

const MarketInfo: React.FC = React.memo(() => {
	return (
		<Container>
			<ChartWrapper />
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
