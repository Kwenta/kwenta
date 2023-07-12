import { wei } from '@synthetixio/wei'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import StakeCard from 'components/StakeCard'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveKwentaToken, stakeEscrowV2, unstakeEscrowV2 } from 'state/staking/actions'
import {
	selectCanStakeEscrowedKwenta,
	selectCanUnstakeEscrowedKwenta,
	selectIsApprovingKwenta,
	selectIsKwentaTokenApprovedV2,
	selectIsStakedEscrowedKwenta,
	selectIsStakingEscrowedKwenta,
	selectIsUnstakedEscrowedKwenta,
	selectIsUnstakingEscrowedKwenta,
	selectStakedEscrowedKwentaBalanceV2,
	selectUnstakedEscrowedKwentaBalanceV2,
} from 'state/staking/selectors'

const EscrowInputCard: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const stakedEscrowedKwentaBalance = useAppSelector(selectStakedEscrowedKwentaBalanceV2)
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApprovedV2)
	const unstakedEscrowedKwentaBalance = useAppSelector(selectUnstakedEscrowedKwentaBalanceV2)
	const stakeEnabled = useAppSelector(selectCanStakeEscrowedKwenta)
	const unstakeEnabled = useAppSelector(selectCanUnstakeEscrowedKwenta)
	const isStakedEscrowedKwenta = useAppSelector(selectIsStakedEscrowedKwenta)
	const isUnstakedEscrowedKwenta = useAppSelector(selectIsUnstakedEscrowedKwenta)
	const isUnstakingEscrowedKwenta = useAppSelector(selectIsUnstakingEscrowedKwenta)
	const isStakingEscrowedKwenta = useAppSelector(selectIsStakingEscrowedKwenta)
	const isApprovingKwenta = useAppSelector(selectIsApprovingKwenta)

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwentaStakingV2'))
	}, [dispatch])

	const handleStakeEscrow = useCallback(
		(amount: string) => {
			dispatch(stakeEscrowV2(wei(amount).toBN()))
		},
		[dispatch]
	)

	const handleUnstakeEscrow = useCallback(
		(amount: string) => {
			dispatch(unstakeEscrowV2(wei(amount).toBN()))
		},
		[dispatch]
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
