import { FC } from 'react';
import { useRecoilState } from 'recoil';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { activePositionsTabState } from 'store/ui';

import OpenPositions from './OpenPositions';
import Portfolio from './Portfolio';

type MobileDashboardProps = {
	exchangeTokens?: any;
};

const MobileDashboard: FC<MobileDashboardProps> = ({ exchangeTokens = [] }) => {
	// in the mobile dashboard, there are no differences between positions and markets tab
	const [activePositionsTab, setActivePositionsTab] = useRecoilState(activePositionsTabState);

	const exchangeTokenBalances = exchangeTokens.reduce(
		(initial: number, { usdBalance }: { usdBalance: number }) => initial + usdBalance,
		0
	);

	return (
		<div>
			<CompetitionBanner />
			<Portfolio exchangeTokenBalances={exchangeTokenBalances} />
			<OpenPositions
				activePositionsTab={activePositionsTab}
				setActivePositionsTab={setActivePositionsTab}
				exchangeTokens={exchangeTokens}
				exchangeTokenBalances={exchangeTokenBalances}
			/>
		</div>
	);
};

export default MobileDashboard;
