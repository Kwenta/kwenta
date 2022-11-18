import { wei } from '@synthetixio/wei';
import { useMemo } from 'react';
import { useAppSelector } from 'state/hooks';

import useRewardsTimer from 'hooks/useRewardsTimer';
import { toWei, truncateNumbers } from 'utils/formatters/number';

import { GridContainer } from './common';
import GridData from './GridData';

const StakeGrid = () => {
	const { balance, earnedRewards, endDate, rewardRate, totalSupply } = useAppSelector(
		({ earn }) => ({
			balance: earn.balance,
			earnedRewards: earn.earnedRewards,
			endDate: earn.endDate,
			rewardRate: earn.rewardRate,
			totalSupply: earn.totalSupply,
		})
	);
	const timeTillDeadline = useRewardsTimer(new Date(endDate));

	const yieldPerDay = useMemo(() => {
		const balanceWei = toWei(balance);
		const rewardRateWei = wei(rewardRate);
		const totalSupplyWei = wei(totalSupply);

		const rawYield = totalSupplyWei.gt(0)
			? balanceWei.div(totalSupplyWei).mul(rewardRateWei)
			: wei(0);

		return truncateNumbers(rawYield.toString(), 4);
	}, [balance, rewardRate, totalSupply]);

	return (
		<GridContainer>
			<GridData title="Your Yield / Day" value={yieldPerDay} hasKwentaLogo />
			<GridData title="Your Rewards" value={truncateNumbers(earnedRewards, 4)} hasKwentaLogo />
			<GridData title="Time Remaining" value={timeTillDeadline} />
		</GridContainer>
	);
};

export default StakeGrid;
