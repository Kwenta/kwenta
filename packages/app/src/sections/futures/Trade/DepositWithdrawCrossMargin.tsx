import { ZERO_WEI, MIN_MARGIN_AMOUNT } from '@kwenta/sdk/constants'
import { formatDollars } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import dynamic from 'next/dynamic'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import CaretDownIcon from 'assets/svg/app/caret-down-slim.svg'
import CaretUpIcon from 'assets/svg/app/caret-up-slim.svg'
import BaseModal from 'components/BaseModal'
import Button from 'components/Button'
import { CardHeader } from 'components/Card'
import Error from 'components/ErrorView'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRowCentered } from 'components/layout/flex'
import SegmentedControl from 'components/SegmentedControl'
import Spacer from 'components/Spacer'
import { selectSNXUSDBalance } from 'state/balances/selectors'
import {
	approveCrossMarginDeposit,
	depositCrossMarginMargin,
	withdrawCrossMargin,
} from 'state/futures/crossMargin/actions'
import {
	selectCrossMarginAvailableMargin,
	selectDepositAllowances,
} from 'state/futures/crossMargin/selectors'
import {
	selectIsApprovingCrossDeposit,
	selectIsolatedTransferError,
	selectIsSubmittingIsolatedTransfer,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type Props = {
	onDismiss(): void
	defaultTab: 'deposit' | 'withdraw'
}

type BalanceStatus = 'low_balance' | 'no_balance' | 'high_balance'

const SocketBridge = dynamic(() => import('../../../components/SocketBridge'), {
	ssr: false,
})

const PLACEHOLDER = '$0.00'

const DepositWithdrawCrossMarginModal: React.FC<Props> = ({ onDismiss, defaultTab }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const submitting = useAppSelector(selectIsSubmittingIsolatedTransfer)
	const approving = useAppSelector(selectIsApprovingCrossDeposit)
	const txError = useAppSelector(selectIsolatedTransferError)
	const usdBalance = useAppSelector(selectSNXUSDBalance)
	const availableMargin = useAppSelector(selectCrossMarginAvailableMargin)
	const allowances = useAppSelector(selectDepositAllowances)

	const minDeposit = useMemo(() => {
		// TODO: Calculate min deposit based on accessible margin
		return MIN_MARGIN_AMOUNT
	}, [])

	const [openSocket, setOpenSocket] = useState(false)
	const [amount, setAmount] = useState('')
	const [transferType, setTransferType] = useState(defaultTab === 'deposit' ? 0 : 1)

	const susdBal = transferType === 0 ? usdBalance : availableMargin

	const balanceStatus: BalanceStatus = useMemo(
		() =>
			availableMargin.gt(ZERO_WEI) || usdBalance.gt(minDeposit)
				? 'high_balance'
				: usdBalance.eq(ZERO_WEI)
				? 'no_balance'
				: 'low_balance',
		[availableMargin, minDeposit, usdBalance]
	)

	const requiresApproval = useMemo(() => {
		if (transferType === 0) {
			return !allowances.SNXUSD?.gt(amount || 0)
		}
		return false
	}, [allowances, amount, transferType])

	useEffect(() => {
		switch (balanceStatus) {
			case 'no_balance':
			case 'low_balance':
				setOpenSocket(true)
				break
			case 'high_balance':
				setOpenSocket(false)
		}
	}, [balanceStatus])

	const isDisabled = useMemo(() => {
		if (!amount || submitting || approving) {
			return true
		}
		const amtWei = wei(amount)
		if (amtWei.eq(0) || amtWei.gt(susdBal) || (transferType === 0 && amtWei.lt(minDeposit))) {
			return true
		}
		return false
	}, [amount, susdBal, minDeposit, transferType, submitting, approving])

	const computedWithdrawAmount = useMemo(
		() => (availableMargin.eq(wei(amount || 0)) ? availableMargin : wei(amount || 0)),
		[amount, availableMargin]
	)

	const onChangeShowSocket = useCallback(() => setOpenSocket(!openSocket), [openSocket])

	const handleSetMax = useCallback(() => {
		if (transferType === 0) {
			setAmount(susdBal.toString())
		} else {
			setAmount(availableMargin.toString())
		}
	}, [susdBal, availableMargin, transferType])

	const onChangeTab = (selection: number) => {
		setTransferType(selection)
		setAmount('')
	}

	const onDepositOrApprove = () => {
		if (!allowances.SNXUSD?.gt(amount)) {
			dispatch(approveCrossMarginDeposit())
		} else {
			dispatch(depositCrossMarginMargin(wei(amount)))
		}
	}

	const onWithdraw = () => {
		dispatch(withdrawCrossMargin(computedWithdrawAmount))
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
			{balanceStatus === 'high_balance' ? (
				<StyledSegmentedControl
					values={['Deposit', 'Withdraw']}
					selectedIndex={transferType}
					onChange={onChangeTab}
				/>
			) : balanceStatus === 'no_balance' ? (
				<Disclaimer>{t('futures.market.trade.margin.modal.bridge.no-balance')}</Disclaimer>
			) : (
				<Disclaimer>{t('futures.market.trade.margin.modal.bridge.low-balance')}</Disclaimer>
			)}
			{transferType === 0 && (
				<>
					<StyledCardHeader onClick={onChangeShowSocket} noBorder={openSocket}>
						<BalanceText>{t('futures.market.trade.margin.modal.bridge.title')}</BalanceText>
						{openSocket ? <CaretUpIcon /> : <CaretDownIcon />}
					</StyledCardHeader>
					{openSocket ? <SocketBridge /> : <Spacer height={20} />}
				</>
			)}
			<BalanceContainer>
				<BalanceText>{t('futures.market.trade.margin.modal.balance')}:</BalanceText>
				<BalanceText>
					<span>{formatDollars(susdBal)}</span> sUSD
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
			{transferType === 0 ? (
				<MinimumAmountDisclaimer>
					{t('futures.market.trade.margin.modal.deposit.disclaimer')}
				</MinimumAmountDisclaimer>
			) : (
				<Spacer height={20} />
			)}

			<Button
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={isDisabled}
				loading={submitting || approving}
				fullWidth
				onClick={transferType === 0 ? onDepositOrApprove : onWithdraw}
				variant="flat"
			>
				{transferType === 0
					? requiresApproval
						? t('futures.market.trade.margin.modal.deposit.approve-button')
						: t('futures.market.trade.margin.modal.deposit.button')
					: t('futures.market.trade.margin.modal.withdraw.button')}
			</Button>
			{txError && (
				<Error containerStyle={{ margin: '16px 0 0 0' }} message={txError} formatter="revert" />
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
	margin: 10px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: center;
`

const Disclaimer = styled.div`
	font-size: 12px;
	line-height: 120%;
	margin: 10px 0;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: left;
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

export default DepositWithdrawCrossMarginModal
