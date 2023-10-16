import { truncateNumbers } from '@kwenta/sdk/utils'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import { FlexDivRowCentered } from 'components/layout/flex'
import { StakingCard } from 'sections/dashboard/Stake/card'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { approveKwentaToken, redeemToken } from 'state/staking/actions'
import {
	selectIsVeKwentaTokenApproved,
	selectIsVKwentaTokenApproved,
	selectVeKwentaBalance,
	selectVKwentaBalance,
} from 'state/staking/selectors'
import { selectDisableRedeemEscrowKwenta } from 'state/stakingMigration/selectors'
import { numericValueCSS } from 'styles/common'

type RedeemInputCardProps = {
	inputLabel: string
	isVKwenta: boolean
}

const RedeemInputCard: FC<RedeemInputCardProps> = ({ inputLabel, isVKwenta }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const vKwentaBalance = useAppSelector(selectVKwentaBalance)
	const veKwentaBalance = useAppSelector(selectVeKwentaBalance)
	const isVKwentaApproved = useAppSelector(selectIsVKwentaTokenApproved)
	const isVeKwentaApproved = useAppSelector(selectIsVeKwentaTokenApproved)
	const VeKwentaDisableRedeem = useAppSelector(selectDisableRedeemEscrowKwenta)

	const isApproved = useMemo(
		() => (isVKwenta ? isVKwentaApproved : isVeKwentaApproved),
		[isVKwenta, isVKwentaApproved, isVeKwentaApproved]
	)

	const balance = useMemo(
		() => (isVKwenta ? vKwentaBalance : veKwentaBalance),
		[isVKwenta, vKwentaBalance, veKwentaBalance]
	)

	const DisableRedeem = useMemo(
		() => (isVKwenta ? false : VeKwentaDisableRedeem),
		[isVKwenta, VeKwentaDisableRedeem]
	)

	const buttonLabel = useMemo(() => {
		return isApproved
			? t('dashboard.stake.tabs.stake-table.redeem')
			: t('dashboard.stake.tabs.stake-table.approve')
	}, [isApproved, t])

	const submitRedeem = useCallback(() => {
		const token = isVKwenta ? 'vKwenta' : 'veKwenta'

		if (!isApproved) {
			dispatch(approveKwentaToken(token))
		} else {
			dispatch(redeemToken(token))
		}
	}, [dispatch, isApproved, isVKwenta])

	return (
		<>
			<StakingInputCardContainer>
				<div>
					<StakeInputHeader>
						<div>{inputLabel}</div>
						<StyledFlexDivRowCentered>
							<div>{t('dashboard.stake.tabs.stake-table.balance')}</div>
							<div className="max">{truncateNumbers(balance, 4)}</div>
						</StyledFlexDivRowCentered>
					</StakeInputHeader>
				</div>
				{DisableRedeem ? (
					<ErrorView
						messageType="warn"
						message={t('dashboard.stake.tabs.redeem.warning')}
						containerStyle={{
							margin: '0',
							marginTop: '25px',
							padding: '10px 0',
						}}
					/>
				) : (
					<Button
						fullWidth
						variant="flat"
						size="small"
						disabled={balance.eq(0) || DisableRedeem}
						onClick={submitRedeem}
					>
						{buttonLabel}
					</Button>
				)}
			</StakingInputCardContainer>
		</>
	)
}

const StyledFlexDivRowCentered = styled(FlexDivRowCentered)`
	column-gap: 5px;
`

const StakingInputCardContainer = styled(StakingCard)`
	min-height: 125px;
	max-height: 250px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
`

const StakeInputHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	color: ${(props) => props.theme.colors.selectedTheme.title};
	font-size: 14px;
	.max {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		${numericValueCSS};
	}
`

export default RedeemInputCard
