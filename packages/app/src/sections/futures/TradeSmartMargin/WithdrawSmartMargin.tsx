import { formatDollars } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import ErrorView from 'components/ErrorView'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRowCentered } from 'components/layout/flex'
import Loader from 'components/Loader'
import { selectTransaction } from 'state/app/selectors'
import { selectIsSubmittingCrossTransfer } from 'state/futures/selectors'
import { withdrawSmartMargin } from 'state/futures/smartMargin/actions'
import { selectWithdrawableSmartMargin } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type Props = {
	onDismiss(): void
}

const PLACEHOLDER = '$0.00'

export default function WithdrawSmartMargin({ onDismiss }: Props) {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const transactionState = useAppSelector(selectTransaction)
	const isSubmitting = useAppSelector(selectIsSubmittingCrossTransfer)
	const totalWithdrawable = useAppSelector(selectWithdrawableSmartMargin)

	const [amount, setAmount] = useState<string>('')

	const disabledReason = useMemo(() => {
		const amtWei = wei(amount || 0)
		if (amtWei.gt(totalWithdrawable))
			return t('futures.market.trade.margin.modal.deposit.exceeds-balance')
	}, [amount, totalWithdrawable, t])

	const withdrawMargin = useCallback(async () => {
		dispatch(withdrawSmartMargin(wei(amount)))
	}, [amount, dispatch])

	const handleSetMax = React.useCallback(() => {
		setAmount(totalWithdrawable.toString())
	}, [totalWithdrawable])

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.margin.modal.withdraw.title`)}
			isOpen
			onDismiss={onDismiss}
		>
			<BalanceContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(totalWithdrawable)}</span> sUSD
				</BalanceText>
			</BalanceContainer>

			<InputContainer
				dataTestId="futures-market-trade-withdraw-margin-input"
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
				}
			/>

			<Button
				variant="flat"
				data-testid="futures-market-trade-withdraw-margin-button"
				disabled={!!disabledReason || !amount || isSubmitting}
				fullWidth
				onClick={withdrawMargin}
			>
				{isSubmitting ? (
					<Loader />
				) : (
					disabledReason || t(`futures.market.trade.margin.modal.withdraw.button`)
				)}
			</Button>

			{transactionState?.error && (
				<ErrorView
					containerStyle={{ margin: '16px 0 0 0' }}
					message={transactionState.error}
					formatter="revert"
				/>
			)}
		</StyledBaseModal>
	)
}

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-top: 12px;
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`

export const BalanceText = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
`

const InputContainer = styled(NumericInput)`
	margin-bottom: 10px;
`
