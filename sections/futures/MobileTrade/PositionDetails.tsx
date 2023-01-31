import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import UploadIcon from 'assets/svg/futures/upload-icon.svg';
import { SectionHeader, SectionSeparator, SectionTitle } from 'sections/futures/mobile';
import { selectMarketAsset, selectPosition } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { resetButtonCSS } from 'styles/common';

import PositionCard from '../PositionCard';
import ShareModal from '../ShareModal';

const PositionDetails = () => {
	const position = useAppSelector(selectPosition);
	const marketAsset = useAppSelector(selectMarketAsset);

	const [showShareModal, setShowShareModal] = useState(false);

	const handleOpenShareModal = useCallback(() => {
		setShowShareModal(!showShareModal);
	}, [showShareModal]);

	return position?.position ? (
		<>
			<PositionDetailsContainer>
				<SectionHeader>
					<SectionTitle>Open Position</SectionTitle>
					<IconButton onClick={handleOpenShareModal}>
						<UploadIcon />
					</IconButton>
				</SectionHeader>
				<PositionCard />
			</PositionDetailsContainer>
			{showShareModal && (
				<ShareModal
					position={position}
					marketAsset={marketAsset}
					setShowShareModal={setShowShareModal}
				/>
			)}
		</>
	) : (
		<SectionSeparator />
	);
};

const PositionDetailsContainer = styled.div`
	margin: 15px;
`;

const IconButton = styled.button`
	${resetButtonCSS};
	padding-top: 5px;
	padding-left: 64px;

	svg {
		width: 14px;
		height: 14px;
		fill: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

export default PositionDetails;
