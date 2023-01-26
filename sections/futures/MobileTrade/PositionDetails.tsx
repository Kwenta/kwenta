import React from 'react';
import styled from 'styled-components';

import { SectionHeader, SectionTitle } from 'sections/futures/mobile';
import { selectPosition } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import PositionCard from '../PositionCard';
import EmptyPositionCard from '../PositionCard/EmptyPositionCard';

const PositionDetails = () => {
	const position = useAppSelector(selectPosition);

	return position?.position ? (
		<PositionDetailsContainer>
			<SectionHeader>
				<SectionTitle>Open Position</SectionTitle>
			</SectionHeader>
			<PositionCard />
		</PositionDetailsContainer>
	) : (
		<PositionDetailsContainer>
			<SectionHeader>
				<SectionTitle>Open Position</SectionTitle>
			</SectionHeader>
			<EmptyPositionCard />
		</PositionDetailsContainer>
	);
};

const PositionDetailsContainer = styled.div`
	margin: 15px;
`;

export default PositionDetails;
