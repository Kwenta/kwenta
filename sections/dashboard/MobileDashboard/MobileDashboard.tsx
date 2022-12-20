import Wei from '@synthetixio/wei';
import { FC } from 'react';
import { useRecoilState } from 'recoil';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { activePositionsTabState } from 'store/ui';
import { zeroBN } from 'utils/formatters/number';

import OpenPositions, { OpenPositionsProps } from './OpenPositions';
import Portfolio from './Portfolio';

type MobileDashboardProps = Pick<OpenPositionsProps, 'exchangeTokens'>;

const MobileDashboard: FC<MobileDashboardProps> = ({ exchangeTokens }) => {
	// in the mobile dashboard, there are no differences between positions and markets tab
	const [activePositionsTab, setActivePositionsTab] = useRecoilState(activePositionsTabState);

	const exchangeTokenBalances = exchangeTokens.reduce(
		(initial: Wei, { usdBalance }) => initial.add(usdBalance),
		zeroBN
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
