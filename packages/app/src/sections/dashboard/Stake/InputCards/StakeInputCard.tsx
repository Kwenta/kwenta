import { wei } from '@synthetixio/wei'
import _ from 'lodash'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import StakeCard from 'components/StakeCard'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveKwentaToken, stakeKwenta, unstakeKwenta } from 'state/staking/actions'
import {
	selectCanStakeKwenta,
	selectCanUnstakeKwenta,
	selectIsApprovingKwenta,
	selectIsKwentaTokenApproved,
	selectIsStakedKwenta,
	selectIsStakingKwenta,
	selectIsUnstakedKwenta,
	selectIsUnstakingKwenta,
	selectKwentaBalance,
	selectStakedKwentaBalance,
} from 'state/staking/selectors'

const StakeInputCard: FC = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalance)
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApproved)
	const isStakedKwenta = useAppSelector(selectIsStakedKwenta)
	const isUnstakedKwenta = useAppSelector(selectIsUnstakedKwenta)
	const stakeEnabled = useAppSelector(selectCanStakeKwenta)
	const unstakeEnabled = useAppSelector(selectCanUnstakeKwenta)
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta)
	const isStakingKwenta = useAppSelector(selectIsStakingKwenta)
	const isApprovingKwenta = useAppSelector(selectIsApprovingKwenta)

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwenta'))
	}, [dispatch])

	const handleStakeKwenta = useCallback(
		(amount: string) => {
			dispatch(stakeKwenta(wei(amount).toBN()))
		},
		[dispatch]
	)

	const handleUnstakeKwenta = useCallback(
		(amount: string) => {
			dispatch(unstakeKwenta(wei(amount).toBN()))
		},
		[dispatch]
	)

	return (
		<StakeCard
			title={t('dashboard.stake.tabs.stake-table.kwenta-token')}
			stakeBalance={kwentaBalance}
			unstakeBalance={stakedKwentaBalance}
			onStake={handleStakeKwenta}
			onUnstake={handleUnstakeKwenta}
			stakeEnabled={stakeEnabled}
			unstakeEnabled={unstakeEnabled}
			isStaked={isStakedKwenta}
			isUnstaked={isUnstakedKwenta}
			isApproved={isKwentaTokenApproved}
			onApprove={handleApprove}
			isStaking={isStakingKwenta}
			isUnstaking={isUnstakingKwenta}
			isApproving={isApprovingKwenta}
		/>
	)
}

export default StakeInputCard
