import { wei } from '@synthetixio/wei'
import _ from 'lodash'
import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import StakeCard from 'components/StakeCard'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	approveKwentaToken,
	stakeKwenta,
	stakeKwentaV2,
	unstakeKwenta,
	unstakeKwentaV2,
} from 'state/staking/actions'
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
	selectStakingV1,
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
	const stakingV1 = useAppSelector(selectStakingV1)

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken(stakingV1 ? 'kwenta' : 'kwentaStakingV2'))
	}, [dispatch, stakingV1])

	const handleStakeKwenta = useCallback(
		(amount: string) => {
			dispatch(stakingV1 ? stakeKwenta(wei(amount).toBN()) : stakeKwentaV2(wei(amount).toBN()))
		},
		[dispatch, stakingV1]
	)

	const handleUnstakeKwenta = useCallback(
		(amount: string) => {
			dispatch(stakingV1 ? unstakeKwenta(wei(amount).toBN()) : unstakeKwentaV2(wei(amount).toBN()))
		},
		[dispatch, stakingV1]
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
