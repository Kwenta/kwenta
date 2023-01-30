import { useCallback } from 'react';

import Button from 'components/Button';
import useRewardsTimer from 'hooks/useRewardsTimer';
import { GridContainer } from 'sections/earn/grid';
import { claimRewards } from 'state/earn/actions';
import { selectYieldPerDay } from 'state/earn/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { toWei, truncateNumbers } from 'utils/formatters/number';

import GridData from './GridData';

const TimeRemainingData = () => {
	const endDate = useAppSelector(({ earn }) => earn.endDate);
	const timeTillDeadline = useRewardsTimer(new Date(endDate * 1000));

	return <GridData title="Time Remaining" value={timeTillDeadline} />;
};

const StakeGrid = () => {
	const dispatch = useAppDispatch();
	const earnedRewards = useAppSelector(({ earn }) => earn.earnedRewards);
	const yieldPerDay = useAppSelector(selectYieldPerDay);

	const handleClaim = useCallback(() => {
		dispatch(claimRewards());
	}, [dispatch]);

	return (
		<GridContainer>
			<GridData title="Your Yield / Day" value={yieldPerDay} hasKwentaLogo />
			<GridData title="Your Rewards" value={truncateNumbers(earnedRewards, 4)} hasKwentaLogo>
				<Button
					fullWidth
					variant="flat"
					size="sm"
					style={{ marginTop: 10 }}
					disabled={toWei(earnedRewards).lte(0)}
					onClick={handleClaim}
				>
					Claim Rewards
				</Button>
			</GridData>
			<TimeRemainingData />
		</GridContainer>
	);
};

export default StakeGrid;
