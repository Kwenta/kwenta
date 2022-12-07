import { FC, useCallback } from 'react';

import StakeCard from 'components/StakeCard/StakeCard';
import { approveLPToken, stakeTokens, unstakeTokens } from 'state/earn/actions';
import { selectBalance, selectIsApproved, selectLPTokenBalance } from 'state/earn/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

const EarnStakeCard: FC = () => {
	const dispatch = useAppDispatch();
	const lpTokenBalance = useAppSelector(selectLPTokenBalance);
	const balance = useAppSelector(selectBalance);

	const isApproved = useAppSelector(selectIsApproved);

	const handleApprove = useCallback(() => {
		dispatch(approveLPToken());
	}, [dispatch]);

	const handleStake = useCallback(
		(amount: string) => {
			dispatch(stakeTokens(amount));
		},
		[dispatch]
	);

	const handleUnstake = useCallback(
		(amount: string) => {
			dispatch(unstakeTokens(amount));
		},
		[dispatch]
	);

	return (
		<StakeCard
			title="WETH/KWENTA"
			stakeBalance={lpTokenBalance}
			unstakeBalance={balance}
			onStake={handleStake}
			onUnstake={handleUnstake}
			isApproved={isApproved}
			onApprove={handleApprove}
		/>
	);
};

export default EarnStakeCard;
