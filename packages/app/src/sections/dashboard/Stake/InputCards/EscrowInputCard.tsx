import { wei } from '@synthetixio/wei'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import StakeCard from 'components/StakeCard'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	approveKwentaToken,
	stakeEscrow,
	stakeEscrowV2,
	unstakeEscrow,
	unstakeEscrowV2,
} from 'state/staking/actions'
import {
	selectCanStakeEscrowedKwenta,
	selectCanUnstakeEscrowedKwenta,
	selectIsApprovingKwenta,
	selectIsKwentaTokenApproved,
	selectIsStakedEscrowedKwenta,
	selectIsStakingEscrowedKwenta,
	selectIsUnstakedEscrowedKwenta,
	selectIsUnstakingEscrowedKwenta,
	selectStakedEscrowedKwentaBalance,
	selectStakingV1,
	selectUnstakedEscrowedKwentaBalance,
} from 'state/staking/selectors'

const EscrowInputCard: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalance)
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApproved)
	const unstakedEscrowedKwentaBalance = useAppSelector(selectUnstakedEscrowedKwentaBalance)
	const stakeEnabled = useAppSelector(selectCanStakeEscrowedKwenta)
	const unstakeEnabled = useAppSelector(selectCanUnstakeEscrowedKwenta)
	const isStakedEscrowedKwenta = useAppSelector(selectIsStakedEscrowedKwenta)
	const isUnstakedEscrowedKwenta = useAppSelector(selectIsUnstakedEscrowedKwenta)
	const isUnstakingEscrowedKwenta = useAppSelector(selectIsUnstakingEscrowedKwenta)
	const isStakingEscrowedKwenta = useAppSelector(selectIsStakingEscrowedKwenta)
	const isApprovingKwenta = useAppSelector(selectIsApprovingKwenta)
	const stakingV1 = useAppSelector(selectStakingV1)

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken(stakingV1 ? 'kwenta' : 'kwentaStakingV2'))
	}, [dispatch, stakingV1])

	const handleStakeEscrow = useCallback(
		(amount: string) => {
			dispatch(stakingV1 ? stakeEscrow(wei(amount).toBN()) : stakeEscrowV2(wei(amount).toBN()))
		},
		[dispatch, stakingV1]
	)

	const handleUnstakeEscrow = useCallback(
		(amount: string) => {
			dispatch(stakingV1 ? unstakeEscrow(wei(amount).toBN()) : unstakeEscrowV2(wei(amount).toBN()))
		},
		[dispatch, stakingV1]
	)

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
			isStaking={isStakingEscrowedKwenta}
			isUnstaking={isUnstakingEscrowedKwenta}
			isApproving={isApprovingKwenta}
		/>
	)
}

export default EscrowInputCard
