import { wei } from '@synthetixio/wei';
import { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import StakeCard from 'components/StakeCard/StakeCard';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { approveKwentaToken, stakeEscrow, unstakeEscrow } from 'state/staking/actions';
import {
	selectCanStakeEscrowedKwenta,
	selectCanUnstakeEscrowedKwenta,
	selectIsKwentaTokenApproved,
	selectIsStakedEscrowedKwenta,
	selectIsUnstakedEscrowedKwenta,
	selectStakedEscrowedKwentaBalance,
	selectUnstakedEscrowedKwentaBalance,
} from 'state/staking/selectors';

const EscrowInputCard: FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance);
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApproved);
	const unstakedEscrowedKwentaBalance = useAppSelector(selectUnstakedEscrowedKwentaBalance);
	const stakeEnabled = useAppSelector(selectCanStakeEscrowedKwenta);
	const unstakeEnabled = useAppSelector(selectCanUnstakeEscrowedKwenta);
	const isStakedEscrowedKwenta = useAppSelector(selectIsStakedEscrowedKwenta);
	const isUnstakedEscrowedKwenta = useAppSelector(selectIsUnstakedEscrowedKwenta);

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwenta'));
	}, [dispatch]);

	const handleStakeEscrow = useCallback(
		(amount: string) => {
			dispatch(stakeEscrow(wei(amount).toBN()));
		},
		[dispatch]
	);

	const handleUnstakeEscrow = useCallback(
		(amount: string) => {
			dispatch(unstakeEscrow(wei(amount).toBN()));
		},
		[dispatch]
	);

	return (
		<StakeCard
			title={t('dashboard.stake.tabs.stake-table.ekwenta-token')}
			stakeBalance={unstakedEscrowedKwentaBalance}
			unstakeBalance={stakedEscrowedKwentaBalance}
			stakeEnabled={stakeEnabled}
			unstakeEnabled={unstakeEnabled}
			isStaked={isStakedEscrowedKwenta}
			isUnstaked={isUnstakedEscrowedKwenta}
			isApproved={isKwentaTokenApproved}
			onStake={handleStakeEscrow}
			onUnstake={handleUnstakeEscrow}
			onApprove={handleApprove}
		/>
	);
};

export default EscrowInputCard;
