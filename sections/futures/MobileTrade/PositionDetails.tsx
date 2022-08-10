import React from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ShareIcon from 'assets/svg/futures/share.svg';
import { positionState } from 'store/futures';

import PositionCard from '../PositionCard';
import { SectionHeader, SectionSeparator, SectionTitle } from './common';

const PositionDetails = () => {
	const position = useRecoilValue(positionState);

	return position?.position ? (
		<PositionDetailsContainer>
			<SectionHeader>
				<SectionTitle>
					Open Position
					<ShareIcon />
				</SectionTitle>
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
