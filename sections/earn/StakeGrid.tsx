import { useAppSelector } from 'state/hooks';

import useRewardsTimer from 'hooks/useRewardsTimer';
import { truncateNumbers } from 'utils/formatters/number';

import { GridContainer } from './common';
import GridData from './GridData';

const StakeGrid = () => {
	const { earnedRewards, endDate } = useAppSelector(({ earn }) => ({
		earnedRewards: earn.earnedRewards,
		endDate: earn.endDate,
	}));
	const timeTillDeadline = useRewardsTimer(new Date(endDate));

	return (
		<GridContainer>
			<GridData title="Yield / $1K / Day" value="28.12" hasKwentaLogo />
			<GridData title="Your Rewards" value={truncateNumbers(earnedRewards, 4)} hasKwentaLogo />
			<GridData title="Time Remaining" value={timeTillDeadline} />
		</GridContainer>
	);
};

export default StakeGrid;
