import { FC } from 'react';
import { useRecoilState } from 'recoil';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { activePositionsTabState } from 'store/ui';

import OpenPositions from './OpenPositions';
import Portfolio from './Portfolio';

const MobileDashboard: FC = () => {
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
		</div>
	);
};

export default MobileDashboard;
