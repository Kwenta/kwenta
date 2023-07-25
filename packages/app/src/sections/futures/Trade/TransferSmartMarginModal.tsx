import { formatDollars } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import dynamic from 'next/dynamic'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CaretUpIcon from 'assets/svg/app/caret-up-slim.svg'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import { CardHeader } from 'components/Card'
import Error from 'components/ErrorView'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import Spacer from 'components/Spacer'
import { selectTransaction } from 'state/app/selectors'
import { selectSusdBalance } from 'state/balances/selectors'
import { withdrawCrossMargin } from 'state/futures/actions'
import { selectIsSubmittingCrossTransfer, selectWithdrawableMargin } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type Props = {
	onDismiss(): void
	defaultTab: 'deposit' | 'withdraw'
}

const SocketBridge = dynamic(() => import('../../../components/SocketBridge'), {
	ssr: false,
})

const PLACEHOLDER = '$0.00'

const TransferSmartMarginModal: React.FC<Props> = ({ onDismiss, defaultTab }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const submitting = useAppSelector(selectIsSubmittingCrossTransfer)
	const totalWithdrawable = useAppSelector(selectWithdrawableMargin)
	const transactionState = useAppSelector(selectTransaction)
	const susdBalance = useAppSelector(selectSusdBalance)

	const [amount, setAmount] = useState('')
	const [transferType, setTransferType] = useState(defaultTab === 'deposit' ? 0 : 1)

	const susdBal = transferType === 0 ? susdBalance : totalWithdrawable

	const isDisabled = useMemo(() => {
		const amtWei = wei(amount || 0)
		return submitting || amtWei.eq(0) || amtWei.gt(totalWithdrawable)
	}, [amount, submitting, totalWithdrawable])

	const handleSetMax = useCallback(() => {
		if (transferType === 0) {
			setAmount(susdBal.toString())
		} else {
			setAmount(totalWithdrawable.toString())
		}
	}, [transferType, susdBal, totalWithdrawable])

	const onChangeTab = (selection: number) => {
		setTransferType(selection)
		setAmount('')
	}

	const onWithdraw = () => {
		dispatch(withdrawCrossMargin(wei(amount)))
	}

	return (
		<StyledBaseModal
			title={
				transferType === 0
					? t('futures.market.trade.margin.modal.deposit.title')
					: t('futures.market.trade.margin.modal.withdraw.title')
			}
			isOpen
			onDismiss={onDismiss}
		>
			<StyledSegmentedControl
				values={['Deposit', 'Withdraw']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>
			{transferType === 0 && (
				<>
					<StyledCardHeader noBorder>
						<BalanceText>{t('futures.market.trade.margin.modal.bridge.title')}</BalanceText>
						<CaretUpIcon />
					</StyledCardHeader>
					<SocketBridge />
					<Spacer height={20} />
				</>
			)}
			<BalanceContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(susdBal)}</span> sUSD
				</BalanceText>
			</BalanceContainer>
			{transferType === 0 ? (
				<>
					<Spacer height={20} />
					<MinimumAmountDisclaimer>
						{t('futures.market.trade.margin.modal.deposit.disclaimer')}
					</MinimumAmountDisclaimer>
				</>
			) : (
				<>
					<NumericInput
						dataTestId="futures-market-trade-deposit-margin-input"
						placeholder={PLACEHOLDER}
						value={amount}
						onChange={(_, v) => setAmount(v)}
						right={
							<MaxButton onClick={handleSetMax}>
								{t('futures.market.trade.margin.modal.max')}
							</MaxButton>
						}
					/>
					<Spacer height={20} />
					<Button
						data-testid="futures-market-trade-deposit-margin-button"
						disabled={isDisabled}
						fullWidth
						onClick={onWithdraw}
						variant="flat"
					>
						{t('futures.market.trade.margin.modal.withdraw.button')}
					</Button>
				</>
			)}

			{transactionState?.error && (
				<Error
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
		margin-top: 5vh;
	}

	.card-header {
		padding: 10px 20px 0px;
	}
`

export const BalanceContainer = styled(FlexDivRowCentered)`
	margin-bottom: 8px;
	p {
		margin: 0;
	}
`

export const BalanceText = styled.p<{ $gold?: boolean }>`
	color: ${(props) =>
		props.$gold ? props.theme.colors.selectedTheme.yellow : props.theme.colors.selectedTheme.gray};
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

const MinimumAmountDisclaimer = styled.div`
	font-size: 12px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: center;
`

const StyledSegmentedControl = styled(SegmentedControl)`
	margin: 16px 0;
`

const StyledCardHeader = styled(CardHeader)<{ noBorder: boolean }>`
	display: flex;
	justify-content: space-between;
	height: 30px;
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.regular};
	border-bottom: ${(props) => (props.noBorder ? 'none' : props.theme.colors.selectedTheme.border)};
	margin-left: 0px;
	padding: 0px;
	cursor: pointer;
`

export default TransferSmartMarginModal
