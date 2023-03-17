import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import UploadIcon from 'assets/svg/futures/upload-icon.svg';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import FuturesPositionsTable from 'sections/dashboard/FuturesPositionsTable';
import { SectionHeader, SectionSeparator, SectionTitle } from 'sections/futures/mobile';
import { selectFuturesType, selectPosition } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { resetButtonCSS } from 'styles/common';

import PositionCard from '../PositionCard';
import ShareModal from '../ShareModal';
import FuturesUnsupportedNetwork from '../Trade/FuturesUnsupported';

const PositionDetails = () => {
	const position = useAppSelector(selectPosition);
	const accountType = useAppSelector(selectFuturesType);
	const isL2 = useIsL2();
	const { walletAddress } = Connector.useContainer();

	const [showShareModal, setShowShareModal] = useState(false);

	const handleOpenShareModal = useCallback(() => {
		setShowShareModal(!showShareModal);
	}, [showShareModal]);

	if (walletAddress && !isL2) {
		return (
			<SwitchNetworkContainer>
				<FuturesUnsupportedNetwork />
			</SwitchNetworkContainer>
		);
	}

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
				<FuturesPositionsTable
					accountType={accountType}
					showCurrentMarket={false}
					showEmptyTable={false}
				/>
			</PositionDetailsContainer>
			{showShareModal && <ShareModal position={position} setShowShareModal={setShowShareModal} />}
		</>
	) : (
		<>
			<SectionSeparator />
			<FuturesPositionsTable
				accountType={accountType}
				showCurrentMarket={false}
				showEmptyTable={false}
			/>
		</>
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

const SwitchNetworkContainer = styled.div`
	padding: 10px 15px;
`;

export default PositionDetails;
