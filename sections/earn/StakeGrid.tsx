import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import useRewardsTimer from 'hooks/useRewardsTimer';
import { GridContainer } from 'sections/earn/grid';
import { claimRewards, fetchEarnTokenPrices } from 'state/earn/actions';
import { selectEarnApy, selectEarnedRewards, selectYieldPerDay } from 'state/earn/selectors';
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks';
import { formatPercent, truncateNumbers } from 'utils/formatters/number';

import GridData from './GridData';

const TimeRemainingData = () => {
	const endDate = useAppSelector(({ earn }) => earn.endDate);
	const timeTillDeadline = useRewardsTimer(new Date(endDate * 1000));

	return <GridData title="Time Remaining" value={timeTillDeadline} />;
};

const StakeGrid = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const earnedRewards = useAppSelector(selectEarnedRewards);
	const yieldPerDay = useAppSelector(selectYieldPerDay);
	const earnApy = useAppSelector(selectEarnApy);

	usePollAction('fetchEarnTokenPrices', fetchEarnTokenPrices, { intervalTime: 30000 });

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
					disabled={earnedRewards.lte(0)}
					onClick={handleClaim}
				>
					Claim Rewards
				</Button>
			</GridData>
			<GridData
				title={t('dashboard.stake.tabs.staking.annual-percentage-rate')}
				value={formatPercent(earnApy, { minDecimals: 2 })}
			/>
			<TimeRemainingData />
		</GridContainer>
	);
};

export default StakeGrid;
