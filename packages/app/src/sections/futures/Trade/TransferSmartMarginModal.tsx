import { formatNumber, truncateNumbers } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import dynamic from 'next/dynamic'
import React, { FC, useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CaretUpIcon from 'assets/svg/app/caret-up-slim.svg'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import PencilButton from 'components/Button/PencilButton'
import { CardHeader } from 'components/Card'
import Error from 'components/ErrorView'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import Spacer from 'components/Spacer'
import { Body, NumericValue } from 'components/Text'
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults'
import { selectTransaction } from 'state/app/selectors'
import { setSelectedSwapDepositToken } from 'state/futures/reducer'
import { selectIsSubmittingCrossTransfer as selectIsSubmittingSmartTransfer } from 'state/futures/selectors'
import {
	approveSmartMargin,
	depositSmartMargin,
	withdrawSmartMargin,
} from 'state/futures/smartMargin/actions'
import {
	selectApprovingSwapDeposit,
	selectMaxSwapToken,
	selectSwapDepositAllowance,
	selectSwapDepositBalance,
	selectSwapDepositSlippage,
} from 'state/futures/smartMargin/selectors'
import { selectWithdrawableSmartMargin } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import SwapSlippageSelect from '../SwapSlippageSelect'
import SwapDepositTokenSelector from '../TradeSmartMargin/SwapDepositTokenSelector'

type Props = {
	onDismiss(): void
	defaultTab: TransferType
}

const SocketBridge = dynamic(() => import('../../../components/SocketBridge'), {
	ssr: false,
})

const PLACEHOLDER = '0.00'

type DepositInputProps = {
	value: string
	setValue(value: string): void
}

const DepositInput: FC<DepositInputProps> = ({ value, setValue }) => {
	return (
		<DepositInputContainer>
			<DepositInputMain placeholder="0.00" value={value} onChange={(_, v) => setValue(v)} />
			<SwapDepositTokenSelector small={false} />
		</DepositInputContainer>
	)
}

type DepositTabProps = {
	extra?: React.ReactNode
}

export const DepositTab: FC<DepositTabProps> = ({ extra }) => {
	const { t } = useTranslation()
	const [amount, setAmount] = useState('')
	const [slippageControlVisible, toggleSlippageControl] = useReducer((o) => !o, false)

	const dispatch = useAppDispatch()

	const balance = useAppSelector(selectSwapDepositBalance)
	const allowance = useAppSelector(selectSwapDepositAllowance)
	const submitting = useAppSelector(selectIsSubmittingSmartTransfer)
	const approving = useAppSelector(selectApprovingSwapDeposit)
	const swapDepositSlippage = useAppSelector(selectSwapDepositSlippage)

	const needsApproval = useMemo(() => {
		const amtWei = wei(amount || 0)
		return allowance.eq(0) || amtWei.gt(allowance)
	}, [amount, allowance])

	const isDisabled = useMemo(() => {
		if (balance.eq(0)) {
			return true
		} else if (needsApproval) {
			return approving
		} else {
			const amtWei = wei(amount || 0)
			return submitting || amtWei.eq(0) || amtWei.gt(balance)
		}
	}, [amount, submitting, balance, needsApproval, approving])

	const handleSubmit = useCallback(() => {
		if (needsApproval) {
			dispatch(approveSmartMargin())
		} else {
			dispatch(depositSmartMargin(wei(amount)))
		}
	}, [dispatch, amount, needsApproval])

	const buttonKey = useMemo(() => {
		return needsApproval ? 'approve' : approving ? 'approving' : 'deposit'
	}, [needsApproval, approving])

	const handleSetMax = useCallback(() => {
		setAmount(truncateNumbers(balance, DEFAULT_CRYPTO_DECIMALS))
	}, [balance])

	return (
		<>
			<BalanceContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.deposit.amount')}:</BalanceText>
				<BalanceText>
					{t('futures.market.trade.margin.modal.balance')}:{' '}
					<NumericValue size="small" as="span" onClick={handleSetMax} style={{ cursor: 'pointer' }}>
						{formatNumber(balance)}
					</NumericValue>
				</BalanceText>
			</BalanceContainer>

			<DepositInput value={amount} setValue={setAmount} />
			<Spacer height={20} />
			<Spacer height={5} />
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<Body color="secondary">
					{t('futures.market.trade.margin.modal.deposit.max-slippage')}:
				</Body>
				<FlexDivRowCentered>
					<Body mono>{`${swapDepositSlippage}%`}</Body>
					<PencilButton width={10} height={10} onClick={toggleSlippageControl} />
				</FlexDivRowCentered>
			</div>
			<Spacer height={20} />
			{slippageControlVisible && <SwapSlippageSelect />}
			<MinimumAmountDisclaimer>
				{t('futures.market.trade.margin.modal.deposit.disclaimer')}
			</MinimumAmountDisclaimer>
			<Spacer height={!!extra ? 5 : 20} />
			{extra && (
				<>
					{extra}
					<Spacer height={20} />
				</>
			)}
			<Button
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={handleSubmit}
				variant="flat"
			>
				{t(`futures.market.trade.margin.modal.buttons.${buttonKey}`)}
			</Button>
		</>
	)
}

const WithdrawTab = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [amount, setAmount] = useState('')
	const totalWithdrawable = useAppSelector(selectWithdrawableSmartMargin)
	const submitting = useAppSelector(selectIsSubmittingSmartTransfer)

	const handleSetMax = useCallback(() => {
		setAmount(truncateNumbers(totalWithdrawable, DEFAULT_CRYPTO_DECIMALS))
	}, [totalWithdrawable])

	const isDisabled = useMemo(() => {
		const amtWei = wei(amount || 0)
		return submitting || amtWei.eq(0) || amtWei.gt(totalWithdrawable)
	}, [amount, submitting, totalWithdrawable])

	const handleWithdraw = useCallback(() => {
		dispatch(withdrawSmartMargin(wei(amount)))
	}, [amount, dispatch])

	return (
		<>
			<BalanceContainer>
				<BalanceText>Amount</BalanceText>
				<BalanceText>
					{t('futures.market.trade.margin.modal.balance')}:{' '}
					<NumericValue size="small" as="span" style={{ cursor: 'pointer' }} onClick={handleSetMax}>
						{formatNumber(totalWithdrawable)}
					</NumericValue>
				</BalanceText>
			</BalanceContainer>

			<NumericInput
				dataTestId="futures-market-trade-deposit-margin-input"
				placeholder={PLACEHOLDER}
				value={amount}
				onChange={(_, v) => setAmount(v)}
				right={
					<MaxButton onClick={handleSetMax}>{t('futures.market.trade.margin.modal.max')}</MaxButton>
				}
			/>
			<Spacer height={20} />
			<Button
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isDisabled}
				fullWidth
				onClick={handleWithdraw}
				variant="flat"
			>
				{t('futures.market.trade.margin.modal.withdraw.button')}
			</Button>
		</>
	)
}

const BridgeTab = () => {
	const { t } = useTranslation()

	return (
		<>
			<StyledCardHeader noBorder>
				<BalanceText>{t('futures.market.trade.margin.modal.bridge.title')}</BalanceText>
				<CaretUpIcon />
			</StyledCardHeader>
			<SocketBridge />
			<Spacer height={20} />
		</>
	)
}

// TODO: Map tranfer type to enum

enum TransferType {
	Deposit = 0,
	Withdraw = 1,
	Bridge = 2,
}

const TransferTabMap = {
	[TransferType.Deposit]: {
		key: 'deposit',
		component: <DepositTab />,
	},
	[TransferType.Withdraw]: {
		key: 'withdraw',
		component: <WithdrawTab />,
	},
	[TransferType.Bridge]: {
		key: 'bridge',
		component: <BridgeTab />,
	},
} as const

const TransferSmartMarginModal: React.FC<Props> = ({ onDismiss, defaultTab }) => {
	const { t } = useTranslation()

	const dispatch = useAppDispatch()
	const transactionState = useAppSelector(selectTransaction)
	const maxToken = useAppSelector(selectMaxSwapToken)

	const [transferType, setTransferType] = useState(defaultTab)

	useEffect(() => {
		dispatch(setSelectedSwapDepositToken(maxToken))
		// eslint-disable-next-line
	}, [])

	const onChangeTab = useCallback((selection: TransferType) => {
		setTransferType(selection)
	}, [])

	return (
		<StyledBaseModal
			title={t(`futures.market.trade.margin.modal.title`)}
			isOpen
			onDismiss={onDismiss}
		>
			<StyledSegmentedControl
				values={['Deposit', 'Withdraw', 'Bridge']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>

			{TransferTabMap[transferType].component}

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
	padding: 5px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 15px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	line-height: 12px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
	font-variant: all-small-caps;
`

const MinimumAmountDisclaimer = styled.div`
	padding: 10px;
	border-radius: 8px;
	background-color: ${(props) => props.theme.colors.selectedTheme.newTheme.disclaimer.background};
	color: ${(props) => props.theme.colors.selectedTheme.newTheme.disclaimer.color};
	font-size: 13px;
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

const DepositInputMain = styled(NumericInput)`
	border: 0;
	padding: 0;
	height: 23px;
	background: transparent;
	box-shadow: none;

	input {
		font-size: 30px;
		letter-spacing: -1px;
		height: 30px;
		width: 100%;
	}
`

const DepositInputContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	border: ${(props) => props.theme.colors.selectedTheme.newTheme.border.style};
	border-radius: 8px;

	input {
		font-size: 19px;
		font-family: ${(props) => props.theme.fonts.mono};
		color: ${(props) => props.theme.colors.selectedTheme.text.value};
		border: none;
		background-color: transparent;

		&:focus {
			outline: none;
		}
	}
`

export default TransferSmartMarginModal
