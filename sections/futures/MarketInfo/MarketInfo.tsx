import React from 'react';
import styled from 'styled-components';

import PositionChart from '../PositionChart';
import UserInfo from '../UserInfo';

const MarketInfo: React.FC = React.memo(() => (
	<Container>
		<PositionChart />
		<UserInfo />
	</Container>
));

const Container = styled.div`
	display: flex;
	flex-direction: column;
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	/*overflow-y: scroll;*/
`;

export default MarketInfo;
