import useRewardsTimer from 'hooks/useRewardsTimer';

import { GridContainer, SplitColumn } from './common';
import GridData from './GridData';

const DEADLINE = new Date('2022-12-18T23:59:59Z');

const StakeGrid = () => {
	const timeTillDeadline = useRewardsTimer(DEADLINE);

	return (
		<GridContainer>
			<GridData title="Yield / $1K / Day" value="28.12" hasKwentaLogo />
			<GridData title="Your Rewards" value="734.72" hasKwentaLogo />
			<GridData title="Time Remaining" value={timeTillDeadline} />
		</GridContainer>
	);
};

export default StakeGrid;
