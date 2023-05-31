import React from 'react';
import styled from 'styled-components';

import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import useWindowSize from 'hooks/useWindowSize';

import MarketDetails from '../MarketDetails/MarketDetails';
import FuturesUnsupportedNetwork from '../Trade/FuturesUnsupported';
import MarketsDropdown from '../Trade/MarketsDropdown';
import { MARKET_SELECTOR_HEIGHT_MOBILE } from '../Trade/MarketsDropdownSelector';
import TradeBalance from '../Trade/TradeBalance';
import OverviewTabs from './OverviewTabs';
import UserTabs from './UserTabs';

const MobileTrade: React.FC = () => {
	const isL2 = useIsL2();
	const { walletAddress } = Connector.useContainer();
	const { deviceType } = useWindowSize();
	return (
		<>
			<MobileContainer mobile={deviceType === 'mobile'} id="mobile-view">
				{deviceType === 'mobile' && <MarketsDropdown mobile={deviceType === 'mobile'} />}
				{deviceType === 'mobile' && <TradeBalance isMobile={true} />}
				<MarketDetails mobile />
			</MobileContainer>
			<OverviewTabs />
			{walletAddress && !isL2 ? (
				<SwitchNetworkContainer>
					<FuturesUnsupportedNetwork />
				</SwitchNetworkContainer>
			) : (
				<UserTabs />
			)}
		</>
	);
};

const MobileContainer = styled.div<{ mobile: boolean }>`
	padding-top: ${(props) => (props.mobile ? MARKET_SELECTOR_HEIGHT_MOBILE : 0)}px;
`;

const SwitchNetworkContainer = styled.div`
	padding: 15px;
`;

export default MobileTrade;
