import { useCallback } from 'react';

import Button from 'components/Button';
import useRewardsTimer from 'hooks/useRewardsTimer';
import { claimRewards } from 'state/earn/actions';
import { selectYieldPerDay } from 'state/earn/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { toWei, truncateNumbers } from 'utils/formatters/number';

import { GridContainer } from './common';
import GridData from './GridData';

const StakeGrid = () => {
	const dispatch = useAppDispatch();
	const { earnedRewards, endDate } = useAppSelector(({ earn }) => ({
		earnedRewards: earn.earnedRewards,
		endDate: earn.endDate,
	}));
	const yieldPerDay = useAppSelector(selectYieldPerDay);

	const timeTillDeadline = useRewardsTimer(new Date(endDate * 1000));

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
			<GridData title="Time Remaining" value={timeTillDeadline} />
		</GridContainer>
	);
};

export default StakeGrid;
