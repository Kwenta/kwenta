import React from 'react';
import { useRecoilState } from 'recoil';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { activePositionsTabState } from 'store/ui';

import { MarketsTab } from '../Markets/Markets';
import FuturesMarkets from './FuturesMarkets';
import OpenPositions from './OpenPositions';
import Portfolio from './Portfolio';
import SpotMarkets from './SpotMarkets';

const MobileDashboard: React.FC = () => {
	// in the mobile dashboard, there are no differences between positions and markets tab
	const [activePositionsTab, setActivePositionsTab] = useRecoilState(activePositionsTabState);

	return (
		<div>
			<CompetitionBanner />
			<Portfolio />
			<OpenPositions
				activePositionsTab={activePositionsTab}
				setActivePositionsTab={setActivePositionsTab}
			/>
			{activePositionsTab === MarketsTab.FUTURES && <FuturesMarkets />}
			{activePositionsTab === MarketsTab.SPOT && <SpotMarkets />}
		</div>
	);
};

export default MobileDashboard;
