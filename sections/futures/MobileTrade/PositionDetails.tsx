import React, { useState, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import ShareIcon from 'assets/svg/futures/share.svg';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import ShareModalMobile from 'sections/futures/ShareModal/ShareModalMobile';
import { positionState, currentMarketState } from 'store/futures';

import PositionCard from '../PositionCard';
import { SectionHeader, SectionSeparator, SectionTitle } from './common';

const PositionDetails = () => {
	const position = useRecoilValue(positionState);
	const marketAsset = useRecoilValue(currentMarketState);
	const futuresPositionQuery = useGetFuturesPositionForAccount();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const futuresPositionHistory = futuresPositionQuery?.data ?? [];
	const [showShareModal, setShowShareModal] = useState<boolean>(false);

	const handleOpenShareModal = useCallback(() => {
		setShowShareModal(!showShareModal);
	}, [showShareModal]);

	return position?.position ? (
		<>
			<PositionDetailsContainer>
				<SectionHeader>
					<SectionTitle>
						Open Position
						{futuresPositionHistory.length && <ShareIcon onClick={handleOpenShareModal} />}
					</SectionTitle>
				</SectionHeader>
				<PositionCard />
			</PositionDetailsContainer>
			{showShareModal && (
				<ShareModalMobile
					setShowShareModal={setShowShareModal}
					futuresPositionHistory={futuresPositionHistory}
					position={position}
					marketAsset={marketAsset}
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

export default PositionDetails;
