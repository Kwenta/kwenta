import React from 'react';
import styled from 'styled-components';

import { selectShowBanner } from 'state/app/selectors';
import { useAppSelector } from 'state/hooks';

import UserInfo from '../UserInfo';
import ChartWrapper from './ChartWrapper';

const MarketInfo: React.FC = React.memo(() => {
	const showBanner = useAppSelector(selectShowBanner);

	return (
		<Container showBanner={showBanner}>
			<ChartWrapper />
			<UserInfo />
		</Container>
	);
});

const Container = styled.div<{ showBanner?: boolean }>`
	height: 100%;
	width: 100%;
	overflow: hidden;
	display: grid;
	grid-template-rows: 1fr calc(320px - ${(props) => (props.showBanner ? 50 : 0)}px);
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
`;

export default MarketInfo;
