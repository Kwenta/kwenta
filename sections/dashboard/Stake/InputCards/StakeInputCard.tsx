import { wei } from '@synthetixio/wei';
import _ from 'lodash';
import { FC, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import StakeCard from 'components/StakeCard/StakeCard';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { approveKwentaToken } from 'state/staking/actions';
import { stakeKwenta, unstakeKwenta } from 'state/staking/actions';
import {
	selectIsKwentaTokenApproved,
	selectIsStakingKwenta,
	selectIsUnstakingKwenta,
	selectKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors';

const StakeInputCard: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const kwentaBalance = useAppSelector(selectKwentaBalance);
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance);
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApproved);
	const isStakingKwenta = useAppSelector(selectIsStakingKwenta);
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta);

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwenta'));
	}, [dispatch]);

	const handleStakeKwenta = useCallback(
		(amount: string) => {
			dispatch(stakeKwenta(wei(amount).toBN()));
		},
		[dispatch]
	);

	const handleUnstakeKwenta = useCallback(
		(amount: string) => {
			dispatch(unstakeKwenta(wei(amount).toBN()));
		},
		[dispatch]
	);

	const stakeEnabled = useMemo(() => {
		return kwentaBalance.gt(0) && !isStakingKwenta;
	}, [kwentaBalance, isStakingKwenta]);

	const unstakeEnabled = useMemo(() => {
		return stakedKwentaBalance.gt(0) && !isUnstakingKwenta;
	}, [stakedKwentaBalance, isUnstakingKwenta]);

	return (
		<StakeCard
			title={t('dashboard.stake.tabs.stake-table.kwenta-token')}
			stakeBalance={kwentaBalance}
			unstakeBalance={stakedKwentaBalance}
			onStake={handleStakeKwenta}
			onUnstake={handleUnstakeKwenta}
			stakeEnabled={stakeEnabled}
			unstakeEnabled={unstakeEnabled}
			isApproved={isKwentaTokenApproved}
			onApprove={handleApprove}
		/>
	);
};

export default StakeInputCard;
