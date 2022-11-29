import { wei } from '@synthetixio/wei';
import { useCallback, useMemo } from 'react';

import Button from 'components/Button';
import useRewardsTimer from 'hooks/useRewardsTimer';
import { claimRewards } from 'state/earn/actions';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { toWei, truncateNumbers } from 'utils/formatters/number';

import { GridContainer } from './common';
import GridData from './GridData';

const SECONDS_PER_DAY = 86400;

const StakeGrid = () => {
	const dispatch = useAppDispatch();
	const { balance, earnedRewards, endDate, rewardRate, totalSupply } = useAppSelector(
		({ earn }) => ({
			balance: earn.balance,
			earnedRewards: earn.earnedRewards,
			endDate: earn.endDate,
			rewardRate: earn.rewardRate,
			totalSupply: earn.totalSupply,
		})
	);
	const timeTillDeadline = useRewardsTimer(new Date(endDate * 1000));

	const yieldPerDay = useMemo(() => {
		const balanceWei = toWei(balance);
		const rewardRateWei = wei(rewardRate);
		const totalSupplyWei = wei(totalSupply);

		const rawYield = totalSupplyWei.gt(0)
			? balanceWei.mul(rewardRateWei).div(totalSupplyWei).mul(SECONDS_PER_DAY)
			: wei(0);

		return truncateNumbers(rawYield.toString(), 4);
	}, [balance, rewardRate, totalSupply]);

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
					disabled={!toWei(earnedRewards).gt(0)}
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
