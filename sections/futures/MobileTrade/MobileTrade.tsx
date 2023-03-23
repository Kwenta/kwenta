import React from 'react';
import styled from 'styled-components';

import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';

import FuturesUnsupportedNetwork from '../Trade/FuturesUnsupported';
import MarketsDropdown from '../Trade/MarketsDropdown';
import OverviewTabs from './OverviewTabs';
import PositionDetails from './PositionDetails';
import UserTabs from './UserTabs';

const MobileTrade: React.FC = () => {
	const isL2 = useIsL2();
	const { walletAddress } = Connector.useContainer();
	return (
		<>
			<MarketsDropdown mobile />
			<OverviewTabs />
			{walletAddress && !isL2 ? (
				<SwitchNetworkContainer>
					<FuturesUnsupportedNetwork />
				</SwitchNetworkContainer>
			) : (
				<>
					<PositionDetails />
					<UserTabs />
				</>
			)}
		</>
	);
};

const SwitchNetworkContainer = styled.div`
	padding: 15px;
`;

export default MobileTrade;
