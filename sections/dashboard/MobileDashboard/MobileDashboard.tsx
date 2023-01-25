import Wei from '@synthetixio/wei';
import { FC } from 'react';

import { CompetitionBanner } from 'sections/shared/components/CompetitionBanner';
import { zeroBN } from 'utils/formatters/number';

import OpenPositions, { OpenPositionsProps } from './OpenPositions';
import Portfolio from './Portfolio';

type MobileDashboardProps = Pick<OpenPositionsProps, 'exchangeTokens'>;

const MobileDashboard: FC<MobileDashboardProps> = ({ exchangeTokens }) => {
	const exchangeTokenBalances = exchangeTokens.reduce(
		(initial: Wei, { usdBalance }) => initial.add(usdBalance),
		zeroBN
	);

	return (
		<div>
			<CompetitionBanner />
			<Portfolio exchangeTokenBalances={exchangeTokenBalances} />
			<OpenPositions
				exchangeTokens={exchangeTokens}
				exchangeTokenBalances={exchangeTokenBalances}
			/>
		</div>
	);
};

export default MobileDashboard;
