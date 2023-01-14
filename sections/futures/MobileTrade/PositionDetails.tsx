import React from 'react';
import styled from 'styled-components';

import { SectionHeader, SectionSeparator, SectionTitle } from 'components/mobile/futures';
import { selectPosition } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import PositionCard from '../PositionCard';

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
		<SectionSeparator />
	);
};

const PositionDetailsContainer = styled.div`
	margin: 15px;
`;

export default PositionDetails;
