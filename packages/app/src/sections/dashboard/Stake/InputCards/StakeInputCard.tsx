import { wei } from '@synthetixio/wei'
import _ from 'lodash'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import StakeCard from 'components/StakeCard'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveKwentaToken, stakeKwentaV2, unstakeKwentaV2 } from 'state/staking/actions'
import {
	selectIsKwentaTokenApprovedV2,
	selectIsStakedKwenta,
	selectIsStakingKwenta,
	selectIsUnstakedKwenta,
	selectIsUnstakingKwenta,
	selectKwentaBalance,
	selectStakedKwentaBalanceV2,
} from 'state/staking/selectors'

type StakeInputCardProps = {
	showWarning?: boolean
}
const StakeInputCard: FC<StakeInputCardProps> = ({ showWarning = false }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const kwentaBalance = useAppSelector(selectKwentaBalance)
	const stakedKwentaBalance = useAppSelector(selectStakedKwentaBalanceV2)
	const isKwentaTokenApproved = useAppSelector(selectIsKwentaTokenApprovedV2)
	const isStakingKwenta = useAppSelector(selectIsStakingKwenta)
	const isUnstakingKwenta = useAppSelector(selectIsUnstakingKwenta)
	const isStakedKwenta = useAppSelector(selectIsStakedKwenta)
	const isUnstakedKwenta = useAppSelector(selectIsUnstakedKwenta)

	const handleApprove = useCallback(() => {
		dispatch(approveKwentaToken('kwentaStakingV2'))
	}, [dispatch])

	const handleStakeKwenta = useCallback(
		(amount: string) => {
			dispatch(stakeKwentaV2(wei(amount).toBN()))
		},
		[dispatch]
	)

	const handleUnstakeKwenta = useCallback(
		(amount: string) => {
			dispatch(unstakeKwentaV2(wei(amount).toBN()))
		},
		[dispatch]
	)

	const stakeEnabled = useMemo(() => {
		return kwentaBalance.gt(0) && !isStakingKwenta
	}, [kwentaBalance, isStakingKwenta])

	const unstakeEnabled = useMemo(() => {
		return stakedKwentaBalance.gt(0) && !isUnstakingKwenta
	}, [stakedKwentaBalance, isUnstakingKwenta])

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
			showWarning={showWarning}
		/>
	)
}

export default StakeInputCard
